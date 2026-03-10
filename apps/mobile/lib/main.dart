import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const PetfolioApp());
}

class PetfolioApp extends StatelessWidget {
  const PetfolioApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Petfolio Mobile MVP',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F6FFF)),
      ),
      home: const MobileHomePage(),
    );
  }
}

class MobileHomePage extends StatefulWidget {
  const MobileHomePage({super.key});

  @override
  State<MobileHomePage> createState() => _MobileHomePageState();
}

class _MobileHomePageState extends State<MobileHomePage> {
  final ApiClient api = ApiClient();
  final TextEditingController emailController = TextEditingController(text: 'guardian@petlife.com');
  final TextEditingController guardianPasswordController = TextEditingController(text: 'Guardian123!');
  final TextEditingController providerEmailController = TextEditingController(text: 'provider@petlife.com');
  final TextEditingController providerPasswordController = TextEditingController(text: 'Provider123!');

  String? guardianToken;
  String? providerToken;
  String message = '';
  bool loading = false;
  int tabIndex = 0;

  List<Map<String, dynamic>> bookings = [];
  List<Map<String, dynamic>> pets = [];
  List<Map<String, dynamic>> album = [];
  List<Map<String, dynamic>> feeds = [];
  final Map<String, List<Map<String, dynamic>>> commentsByFeed = {};
  final Map<String, TextEditingController> commentControllers = {};
  String selectedPetId = '';
  String sourceType = '';
  String mediaType = '';
  String sort = 'latest';

  // ── S7 Health Logs ─────────────────────────────────────────────────────────
  List<Map<String, dynamic>> logTypes = [];
  List<Map<String, dynamic>> healthLogs = [];
  List<Map<String, dynamic>> logMetrics = [];
  List<Map<String, dynamic>> logUnits = [];
  String healthPetId = '';
  String logSelectedTypeId = '';
  String logValueStr = '';
  String logUnitId = '';
  String logDate = '';
  String logTime = '';
  String logTitle = '';
  String logNotes = '';
  String logAlertMsg = '';
  String logAlertSeverity = '';

  // logtype key → metric key + allowed unit keys
  static const Map<String, Map<String, dynamic>> _logMetricMap = {
    'blood_glucose_log': {'metricKey': 'blood_glucose',  'unitKeys': ['mg_dl', 'mmol_l']},
    'insulin_log':       {'metricKey': 'insulin_dose',   'unitKeys': ['iu']},
    'meal_log':          {'metricKey': 'food_weight',    'unitKeys': ['g', 'kcal', 'ml']},
    'water_log':         {'metricKey': 'water_intake',   'unitKeys': ['ml']},
    'activity_log':      {'metricKey': 'duration',       'unitKeys': ['min']},
    'weight_log':        {'metricKey': 'body_weight',    'unitKeys': ['kg']},
  };

  final TextEditingController logValueController = TextEditingController();
  final TextEditingController logTitleController = TextEditingController();
  final TextEditingController logNotesController = TextEditingController();
  final TextEditingController logDateController = TextEditingController();
  final TextEditingController logTimeController = TextEditingController();

  final TextEditingController supplierIdController = TextEditingController();
  final TextEditingController bookingDateController = TextEditingController();
  final TextEditingController bookingTimeController = TextEditingController();
  final TextEditingController bookingNotesController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    guardianPasswordController.dispose();
    providerEmailController.dispose();
    providerPasswordController.dispose();
    supplierIdController.dispose();
    bookingDateController.dispose();
    bookingTimeController.dispose();
    bookingNotesController.dispose();
    logValueController.dispose();
    logTitleController.dispose();
    logNotesController.dispose();
    logDateController.dispose();
    logTimeController.dispose();
    for (final controller in commentControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> loginGuardian() async {
    setState(() {
      loading = true;
      message = '';
    });
    try {
      guardianToken = await api.testLogin(emailController.text.trim());
      await loadGuardianData();
      setState(() => message = 'Guardian login success');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> loginProvider() async {
    setState(() {
      loading = true;
      message = '';
    });
    try {
      providerToken = await api.testLogin(providerEmailController.text.trim());
      setState(() => message = 'Provider login success');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> loginGuardianWithPassword() async {
    setState(() {
      loading = true;
      message = '';
    });
    try {
      guardianToken = await api.passwordLogin(
        emailController.text.trim(),
        guardianPasswordController.text.trim(),
      );
      await loadGuardianData();
      setState(() => message = 'Guardian password login success');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> loginProviderWithPassword() async {
    setState(() {
      loading = true;
      message = '';
    });
    try {
      providerToken = await api.passwordLogin(
        providerEmailController.text.trim(),
        providerPasswordController.text.trim(),
      );
      setState(() => message = 'Provider password login success');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> loadGuardianData() async {
    if (guardianToken == null) return;
    final petData = await api.get('/api/v1/pets', guardianToken!);
    pets = List<Map<String, dynamic>>.from((petData['pets'] as List? ?? []).cast<Map>());
    if (pets.isNotEmpty && selectedPetId.isEmpty) {
      selectedPetId = pets.first['id'] as String? ?? '';
      healthPetId = selectedPetId;
    }
    final bookingData = await api.get('/api/v1/bookings', guardianToken!);
    bookings = List<Map<String, dynamic>>.from((bookingData['bookings'] as List? ?? []).cast<Map>());
    await Future.wait([loadAlbum(), loadFeeds(), loadLogMasterData()]);
    if (healthPetId.isNotEmpty) await loadHealthLogs();
    setState(() {});
  }

  Future<void> loadLogMasterData() async {
    try { logTypes = await api.getList('/api/v1/master/items?category_key=log_type', guardianToken ?? ''); } catch (_) {}
    try { logMetrics = await api.getList('/api/v1/master/items?category_key=metric', guardianToken ?? ''); } catch (_) {}
    try { logUnits = await api.getList('/api/v1/master/items?category_key=unit', guardianToken ?? ''); } catch (_) {}
  }

  Future<void> loadHealthLogs() async {
    if (guardianToken == null || healthPetId.isEmpty) return;
    try {
      final data = await api.get('/api/v1/pets/$healthPetId/logs?limit=50', guardianToken!);
      healthLogs = List<Map<String, dynamic>>.from((data['logs'] as List? ?? []).cast<Map>());
    } catch (_) {
      healthLogs = [];
    }
  }

  Future<void> createHealthLog() async {
    if (guardianToken == null || healthPetId.isEmpty || logSelectedTypeId.isEmpty || logDateController.text.isEmpty) {
      setState(() => message = 'Pet, log type and date are required');
      return;
    }
    setState(() { loading = true; message = ''; });
    try {
      // build values payload if metric applies
      final selectedType = logTypes.firstWhere(
        (lt) => lt['id'] == logSelectedTypeId,
        orElse: () => <String, dynamic>{},
      );
      final typeKey = selectedType['key'] as String? ?? '';
      final metricCfg = _logMetricMap[typeKey];
      List<Map<String, dynamic>> valuesPayload = [];
      if (metricCfg != null && logValueController.text.isNotEmpty && logUnitId.isNotEmpty) {
        final metricItem = logMetrics.firstWhere(
          (m) => m['key'] == metricCfg['metricKey'],
          orElse: () => <String, dynamic>{},
        );
        if ((metricItem['id'] as String?)?.isNotEmpty == true) {
          valuesPayload = [{
            'metric_id': metricItem['id'],
            'unit_id': logUnitId,
            'numeric_value': double.tryParse(logValueController.text) ?? 0,
          }];
        }
      }
      final result = await api.post('/api/v1/pets/$healthPetId/logs', guardianToken!, {
        'logtype_id': logSelectedTypeId,
        'event_date': logDateController.text.trim(),
        if (logTimeController.text.isNotEmpty) 'event_time': logTimeController.text.trim(),
        if (logTitleController.text.isNotEmpty) 'title': logTitleController.text.trim(),
        if (logNotesController.text.isNotEmpty) 'notes': logNotesController.text.trim(),
        if (valuesPayload.isNotEmpty) 'values': valuesPayload,
      });
      // handle alert
      final alert = result['alert'] as Map?;
      if (alert != null) {
        logAlertSeverity = alert['severity'] as String? ?? 'warning';
        final val = alert['value'];
        final unit = alert['unit'] as String? ?? '';
        logAlertMsg = '${alert['type'] ?? ''} — $val $unit';
      } else {
        logAlertMsg = '';
        logAlertSeverity = '';
      }
      // reset form
      logSelectedTypeId = '';
      logUnitId = '';
      logValueController.clear();
      logTitleController.clear();
      logNotesController.clear();
      logDateController.clear();
      logTimeController.clear();
      await loadHealthLogs();
      setState(() => message = 'Log saved');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> loadFeeds() async {
    if (guardianToken == null) {
      feeds = [];
      return;
    }
    final data = await api.get('/api/v1/feeds?limit=50', guardianToken!);
    feeds = List<Map<String, dynamic>>.from((data['feeds'] as List? ?? []).cast<Map>());
  }

  Future<void> loadAlbum() async {
    if (guardianToken == null || selectedPetId.isEmpty) {
      album = [];
      return;
    }
    final path =
        '/api/v1/pet-album?pet_id=$selectedPetId&include_pending=true&sort=$sort'
        '${sourceType.isNotEmpty ? '&source_type=$sourceType' : ''}'
        '${mediaType.isNotEmpty ? '&media_type=$mediaType' : ''}';
    final data = await api.get(path, guardianToken!);
    album = List<Map<String, dynamic>>.from((data['media'] as List? ?? []).cast<Map>());
  }

  Future<void> createBooking() async {
    if (guardianToken == null) return;
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.post('/api/v1/bookings', guardianToken!, {
        'supplier_id': supplierIdController.text.trim(),
        'pet_id': selectedPetId.isEmpty ? null : selectedPetId,
        'requested_date': bookingDateController.text.trim().isEmpty ? null : bookingDateController.text.trim(),
        'requested_time': bookingTimeController.text.trim().isEmpty ? null : bookingTimeController.text.trim(),
        'notes': bookingNotesController.text.trim().isEmpty ? null : bookingNotesController.text.trim(),
      });
      bookingDateController.clear();
      bookingTimeController.clear();
      bookingNotesController.clear();
      await loadGuardianData();
      setState(() => message = 'Booking created');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> createStoreBooking() async {
    if (guardianToken == null) return;
    final supplierId = supplierIdController.text.trim();
    if (supplierId.isEmpty) {
      setState(() => message = 'supplier_id required');
      return;
    }
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.post('/api/v1/stores/$supplierId/bookings', guardianToken!, {
        'supplier_id': supplierId,
        'pet_id': selectedPetId.isEmpty ? null : selectedPetId,
        'requested_date': bookingDateController.text.trim().isEmpty ? null : bookingDateController.text.trim(),
        'requested_time': bookingTimeController.text.trim().isEmpty ? null : bookingTimeController.text.trim(),
        'notes': bookingNotesController.text.trim().isEmpty ? null : bookingNotesController.text.trim(),
      });
      await loadGuardianData();
      setState(() => message = 'Store booking created');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> updateBookingStatus(String bookingId, String status) async {
    if (providerToken == null) {
      setState(() => message = 'Provider login required');
      return;
    }
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.put('/api/v1/bookings/$bookingId/status', providerToken!, {'status': status});
      await loadGuardianData();
      setState(() => message = 'Status updated: $status');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> requestCompletion(String bookingId) async {
    if (providerToken == null) {
      setState(() => message = 'Provider login required');
      return;
    }
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.post('/api/v1/bookings/$bookingId/completion-request', providerToken!, {
        'completion_memo': 'Completed from mobile MVP',
        'media_urls': <String>[
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900',
        ],
      });
      await loadGuardianData();
      setState(() => message = 'Completion requested');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> shareFromCompletion(String bookingId) async {
    if (guardianToken == null) return;
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.post('/api/v1/feeds/from-completion', guardianToken!, {
        'booking_id': bookingId,
        'caption': 'Shared from mobile',
        'visibility_scope': 'public',
      });
      await loadGuardianData();
      setState(() => message = 'Shared completion to feed');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> approveBookingMedia(String feedId, bool approved) async {
    if (guardianToken == null) return;
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.post('/api/v1/feeds/$feedId/approve', guardianToken!, {
        'action': approved ? 'approve' : 'reject',
        'visibility_scope': approved ? 'public' : null,
      });
      await loadAlbum();
      setState(() => message = approved ? 'Approved' : 'Rejected');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> updateAlbumCaption(String mediaId, String caption) async {
    if (guardianToken == null) return;
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.put('/api/v1/pet-album/$mediaId', guardianToken!, {'caption': caption});
      await loadAlbum();
      setState(() => message = 'Caption updated');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> deleteAlbum(String mediaId) async {
    if (guardianToken == null) return;
    setState(() {
      loading = true;
      message = '';
    });
    try {
      await api.delete('/api/v1/pet-album/$mediaId', guardianToken!);
      await loadAlbum();
      setState(() => message = 'Deleted');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> toggleLike(String feedId, bool currentlyLiked) async {
    if (guardianToken == null) return;
    setState(() => loading = true);
    try {
      if (currentlyLiked) {
        await api.delete('/api/v1/feeds/$feedId/like', guardianToken!);
      } else {
        await api.post('/api/v1/feeds/$feedId/like', guardianToken!, {});
      }
      await loadFeeds();
      setState(() {});
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> loadComments(String feedId) async {
    if (guardianToken == null) return;
    try {
      final data = await api.get('/api/v1/feeds/$feedId/comments', guardianToken!);
      commentsByFeed[feedId] = List<Map<String, dynamic>>.from((data['comments'] as List? ?? []).cast<Map>());
      setState(() {});
    } catch (e) {
      setState(() => message = e.toString());
    }
  }

  Future<void> createComment(String feedId) async {
    if (guardianToken == null) return;
    final controller = commentControllers.putIfAbsent(feedId, () => TextEditingController());
    final content = controller.text.trim();
    if (content.isEmpty) return;
    setState(() => loading = true);
    try {
      await api.post('/api/v1/feeds/$feedId/comments', guardianToken!, {'content': content});
      controller.clear();
      await loadComments(feedId);
      await loadFeeds();
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Petfolio Mobile MVP'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            Wrap(
              spacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('Auth'),
                  selected: tabIndex == 0,
                  onSelected: (_) => setState(() => tabIndex = 0),
                ),
                ChoiceChip(
                  label: const Text('Bookings'),
                  selected: tabIndex == 1,
                  onSelected: (_) => setState(() => tabIndex = 1),
                ),
                ChoiceChip(
                  label: const Text('Gallery'),
                  selected: tabIndex == 2,
                  onSelected: (_) => setState(() => tabIndex = 2),
                ),
                ChoiceChip(
                  label: const Text('Feed'),
                  selected: tabIndex == 3,
                  onSelected: (_) => setState(() => tabIndex = 3),
                ),
                ChoiceChip(
                  label: const Text('Health'),
                  selected: tabIndex == 4,
                  onSelected: (_) => setState(() => tabIndex = 4),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (message.isNotEmpty) Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: const Color(0xFFEAF1FF),
              ),
              child: Text(message),
            ),
            if (tabIndex == 0) _buildAuth(),
            if (tabIndex == 1) _buildBookings(),
            if (tabIndex == 2) _buildGallery(),
            if (tabIndex == 3) _buildFeed(),
            if (tabIndex == 4) _buildHealth(),
          ],
        ),
      ),
    );
  }

  Widget _buildAuth() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('API Base: ${api.baseUrl}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
        const SizedBox(height: 12),
        TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Guardian Email')),
        const SizedBox(height: 8),
        TextField(
          controller: guardianPasswordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Guardian Password'),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ElevatedButton(onPressed: loading ? null : loginGuardianWithPassword, child: const Text('Guardian Password Login')),
            ElevatedButton(onPressed: loading ? null : loginGuardian, child: const Text('Guardian Test Login')),
          ],
        ),
        const SizedBox(height: 16),
        TextField(controller: providerEmailController, decoration: const InputDecoration(labelText: 'Provider Email')),
        const SizedBox(height: 8),
        TextField(
          controller: providerPasswordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Provider Password'),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ElevatedButton(onPressed: loading ? null : loginProviderWithPassword, child: const Text('Provider Password Login')),
            ElevatedButton(onPressed: loading ? null : loginProvider, child: const Text('Provider Test Login')),
          ],
        ),
      ],
    );
  }

  Widget _buildBookings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(controller: supplierIdController, decoration: const InputDecoration(labelText: 'Supplier User ID')),
        DropdownButtonFormField<String>(
          value: selectedPetId.isEmpty ? null : selectedPetId,
          decoration: const InputDecoration(labelText: 'Pet'),
          items: pets
              .map((p) => DropdownMenuItem<String>(
                    value: p['id'] as String?,
                    child: Text((p['name'] ?? '-') as String),
                  ))
              .toList(),
          onChanged: (v) => setState(() => selectedPetId = v ?? ''),
        ),
        TextField(controller: bookingDateController, decoration: const InputDecoration(labelText: 'Date (YYYY-MM-DD)')),
        TextField(controller: bookingTimeController, decoration: const InputDecoration(labelText: 'Time (HH:mm)')),
        TextField(controller: bookingNotesController, decoration: const InputDecoration(labelText: 'Notes')),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ElevatedButton(onPressed: loading ? null : createBooking, child: const Text('Create Booking')),
            ElevatedButton(onPressed: loading ? null : createStoreBooking, child: const Text('Create Store Booking')),
          ],
        ),
        const SizedBox(height: 14),
        const Text('Booking List', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ...bookings.map((b) {
          final id = b['id'] as String? ?? '';
          final status = b['status'] as String? ?? '-';
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('ID: $id'),
                  Text('Status: $status'),
                  Text('Supplier: ${b['supplier_id'] ?? '-'}'),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      OutlinedButton(
                        onPressed: loading ? null : () => updateBookingStatus(id, 'in_progress'),
                        child: const Text('Provider In Progress'),
                      ),
                      OutlinedButton(
                        onPressed: loading ? null : () => updateBookingStatus(id, 'service_completed'),
                        child: const Text('Provider Complete'),
                      ),
                      OutlinedButton(
                        onPressed: loading ? null : () => requestCompletion(id),
                        child: const Text('Completion Request'),
                      ),
                      OutlinedButton(
                        onPressed: loading ? null : () => shareFromCompletion(id),
                        child: const Text('Guardian Share'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildGallery() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DropdownButtonFormField<String>(
          value: selectedPetId.isEmpty ? null : selectedPetId,
          decoration: const InputDecoration(labelText: 'Pet'),
          items: pets
              .map((p) => DropdownMenuItem<String>(
                    value: p['id'] as String?,
                    child: Text((p['name'] ?? '-') as String),
                  ))
              .toList(),
          onChanged: (v) async {
            selectedPetId = v ?? '';
            await loadAlbum();
            setState(() {});
          },
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            DropdownButton<String>(
              value: sourceType.isEmpty ? null : sourceType,
              hint: const Text('Source'),
              items: const [
                DropdownMenuItem(value: 'feed', child: Text('Feed')),
                DropdownMenuItem(value: 'booking_completed', child: Text('Booking')),
                DropdownMenuItem(value: 'health_record', child: Text('Health')),
                DropdownMenuItem(value: 'profile', child: Text('Profile')),
                DropdownMenuItem(value: 'manual_upload', child: Text('Manual')),
              ],
              onChanged: (v) async {
                sourceType = v ?? '';
                await loadAlbum();
                setState(() {});
              },
            ),
            DropdownButton<String>(
              value: mediaType.isEmpty ? null : mediaType,
              hint: const Text('Media'),
              items: const [
                DropdownMenuItem(value: 'image', child: Text('Image')),
                DropdownMenuItem(value: 'video', child: Text('Video')),
              ],
              onChanged: (v) async {
                mediaType = v ?? '';
                await loadAlbum();
                setState(() {});
              },
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (album.isEmpty) const Text('No media'),
        ...album.map((m) => _albumCard(m)),
      ],
    );
  }

  Widget _buildFeed() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          children: [
            ElevatedButton(
              onPressed: loading
                  ? null
                  : () async {
                      setState(() => loading = true);
                      await loadFeeds();
                      setState(() => loading = false);
                    },
              child: const Text('Refresh Feed'),
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (feeds.isEmpty) const Text('No feed posts'),
        ...feeds.map((f) {
          final feedId = f['id'] as String? ?? '';
          final liked = f['liked_by_me'] == 1 || f['liked_by_me'] == true;
          final likeCount = f['like_count'] ?? 0;
          final commentCount = f['comment_count'] ?? 0;
          final caption = (f['caption'] ?? '') as String;
          final mediaUrls = (f['media_urls'] as List? ?? const []).map((e) => '$e').toList();
          final controller = commentControllers.putIfAbsent(feedId, () => TextEditingController());
          final comments = commentsByFeed[feedId] ?? const [];
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Feed ID: $feedId', style: const TextStyle(fontWeight: FontWeight.bold)),
                  if (caption.isNotEmpty) Text(caption),
                  if (mediaUrls.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(mediaUrls.first, maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text('Likes: $likeCount'),
                      const SizedBox(width: 10),
                      Text('Comments: $commentCount'),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    children: [
                      OutlinedButton(
                        onPressed: loading ? null : () => toggleLike(feedId, liked),
                        child: Text(liked ? 'Unlike' : 'Like'),
                      ),
                      OutlinedButton(
                        onPressed: loading ? null : () => loadComments(feedId),
                        child: const Text('Load Comments'),
                      ),
                    ],
                  ),
                  TextField(
                    controller: controller,
                    decoration: const InputDecoration(labelText: 'Write comment'),
                  ),
                  const SizedBox(height: 6),
                  OutlinedButton(
                    onPressed: loading ? null : () => createComment(feedId),
                    child: const Text('Post Comment'),
                  ),
                  if (comments.isNotEmpty) ...[
                    const Divider(),
                    ...comments.map((c) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text('- ${(c['content'] ?? '') as String}'),
                        )),
                  ],
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildHealth() {
    final typeKey = logTypes.firstWhere(
      (lt) => lt['id'] == logSelectedTypeId,
      orElse: () => <String, dynamic>{},
    )['key'] as String? ?? '';
    final metricCfg = _logMetricMap[typeKey];
    final showValueField = metricCfg != null;
    final allowedUnitKeys = metricCfg != null ? List<String>.from(metricCfg['unitKeys'] as List) : <String>[];
    final filteredUnits = logUnits.where((u) => allowedUnitKeys.contains(u['key'] as String?)).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Pet selector ────────────────────────────────────────────────────
        DropdownButtonFormField<String>(
          value: healthPetId.isEmpty ? null : healthPetId,
          decoration: const InputDecoration(labelText: 'Pet'),
          items: pets.map((p) => DropdownMenuItem<String>(
            value: p['id'] as String?,
            child: Text((p['name'] ?? '-') as String),
          )).toList(),
          onChanged: (v) async {
            healthPetId = v ?? '';
            await loadHealthLogs();
            setState(() {});
          },
        ),
        const SizedBox(height: 12),
        // ── Alert banner ────────────────────────────────────────────────────
        if (logAlertMsg.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: logAlertSeverity == 'critical' ? const Color(0xFFFEE2E2) : const Color(0xFFFEF9C3),
            ),
            child: Row(
              children: [
                Expanded(child: Text('⚠️ $logAlertMsg', style: TextStyle(
                  color: logAlertSeverity == 'critical' ? const Color(0xFFB91C1C) : const Color(0xFF92400E),
                ))),
                IconButton(icon: const Icon(Icons.close, size: 18), onPressed: () => setState(() { logAlertMsg = ''; logAlertSeverity = ''; })),
              ],
            ),
          ),
        // ── Log type ────────────────────────────────────────────────────────
        DropdownButtonFormField<String>(
          value: logSelectedTypeId.isEmpty ? null : logSelectedTypeId,
          decoration: const InputDecoration(labelText: 'Log Type *'),
          items: logTypes.map((lt) {
            final label = (lt['display_label'] ?? lt['ko'] ?? lt['key'] ?? '-') as String;
            return DropdownMenuItem<String>(value: lt['id'] as String?, child: Text(label));
          }).toList(),
          onChanged: (v) => setState(() { logSelectedTypeId = v ?? ''; logUnitId = ''; logValueController.clear(); }),
        ),
        const SizedBox(height: 8),
        // ── Numeric value + unit ────────────────────────────────────────────
        if (showValueField) ...[
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: logValueController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: InputDecoration(labelText: metricCfg!['metricKey'] as String),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 110,
                child: DropdownButtonFormField<String>(
                  value: logUnitId.isEmpty ? null : logUnitId,
                  decoration: const InputDecoration(labelText: 'Unit'),
                  items: filteredUnits.map((u) => DropdownMenuItem<String>(
                    value: u['id'] as String?,
                    child: Text((u['display_label'] ?? u['key'] ?? '-') as String),
                  )).toList(),
                  onChanged: (v) => setState(() => logUnitId = v ?? ''),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
        // ── Date / Time ─────────────────────────────────────────────────────
        Row(
          children: [
            Expanded(child: TextField(
              controller: logDateController,
              decoration: const InputDecoration(labelText: 'Date (YYYY-MM-DD) *'),
            )),
            const SizedBox(width: 8),
            Expanded(child: TextField(
              controller: logTimeController,
              decoration: const InputDecoration(labelText: 'Time (HH:mm)'),
            )),
          ],
        ),
        const SizedBox(height: 8),
        TextField(controller: logTitleController, decoration: const InputDecoration(labelText: 'Title')),
        const SizedBox(height: 8),
        TextField(controller: logNotesController, decoration: const InputDecoration(labelText: 'Notes'), maxLines: 2),
        const SizedBox(height: 10),
        ElevatedButton(
          onPressed: loading ? null : createHealthLog,
          child: const Text('Save Log'),
        ),
        const SizedBox(height: 20),
        // ── Timeline ────────────────────────────────────────────────────────
        const Text('Health Timeline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        if (healthLogs.isEmpty) const Text('No health logs yet.'),
        ...healthLogs.map((log) {
          final logTypeLabel = logTypes.firstWhere(
            (lt) => lt['id'] == log['logtype_id'],
            orElse: () => <String, dynamic>{},
          );
          final ltLabel = (logTypeLabel['display_label'] ?? logTypeLabel['ko'] ?? logTypeLabel['key'] ?? log['logtype_id']) as String;
          final values = (log['values'] as List? ?? []).cast<Map>();
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Chip(label: Text(ltLabel, style: const TextStyle(fontSize: 12))),
                      const SizedBox(width: 8),
                      Text('${log['event_date'] ?? ''} ${log['event_time'] ?? ''}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                  if ((log['title'] as String?)?.isNotEmpty == true)
                    Text(log['title'] as String, style: const TextStyle(fontWeight: FontWeight.w500)),
                  if (values.isNotEmpty)
                    Text('Value: ${values.first['numeric_value']} (unit: ${values.first['unit_id']})',
                        style: const TextStyle(fontSize: 13, color: Colors.blueGrey)),
                  if ((log['notes'] as String?)?.isNotEmpty == true)
                    Text(log['notes'] as String, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _albumCard(Map<String, dynamic> media) {
    final captionCtrl = TextEditingController(text: (media['caption'] ?? '') as String);
    final status = media['status'] as String? ?? '-';
    final sourceTypeValue = media['source_type'] as String? ?? '-';
    final feedId = media['source_id'] as String?;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(sourceTypeValue, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text('Status: $status'),
            const SizedBox(height: 6),
            Text((media['media_url'] ?? '-') as String, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 6),
            TextField(controller: captionCtrl, decoration: const InputDecoration(labelText: 'Caption')),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                OutlinedButton(
                  onPressed: loading ? null : () => updateAlbumCaption(media['id'] as String, captionCtrl.text.trim()),
                  child: const Text('Save Caption'),
                ),
                OutlinedButton(
                  onPressed: loading ? null : () => deleteAlbum(media['id'] as String),
                  child: const Text('Delete'),
                ),
                if (sourceTypeValue == 'booking_completed' && status == 'pending' && feedId != null) ...[
                  OutlinedButton(
                    onPressed: loading ? null : () => approveBookingMedia(feedId, true),
                    child: const Text('Approve'),
                  ),
                  OutlinedButton(
                    onPressed: loading ? null : () => approveBookingMedia(feedId, false),
                    child: const Text('Reject'),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ApiClient {
  ApiClient({String? base}) : baseUrl = base ?? _defaultBaseUrl();

  final String baseUrl;
  static const String _defaultWorkersApi = 'https://pet-life-api.adrien-lee.workers.dev';

  static String _defaultBaseUrl() {
    const envBase = String.fromEnvironment('API_BASE_URL');
    if (envBase.isNotEmpty) return envBase;
    if (kIsWeb) return _defaultWorkersApi;
    return _defaultWorkersApi;
  }

  Future<String> testLogin(String email) async {
    final data = await _request('POST', '/api/v1/auth/test-login', body: {'email': email});
    return (data['access_token'] ?? '') as String;
  }

  Future<String> passwordLogin(String email, String password) async {
    final data = await _request('POST', '/api/v1/auth/login', body: {
      'email': email,
      'password': password,
    });
    return (data['access_token'] ?? '') as String;
  }

  Future<Map<String, dynamic>> get(String path, String token) => _request('GET', path, token: token);
  Future<List<Map<String, dynamic>>> getList(String path, String token) => _requestList('GET', path, token: token);
  Future<Map<String, dynamic>> post(String path, String token, Map<String, dynamic> body) =>
      _request('POST', path, token: token, body: body);
  Future<Map<String, dynamic>> put(String path, String token, Map<String, dynamic> body) =>
      _request('PUT', path, token: token, body: body);
  Future<Map<String, dynamic>> delete(String path, String token) => _request('DELETE', path, token: token);

  Future<List<Map<String, dynamic>>> _requestList(
    String method,
    String path, {
    String? token,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) headers['Authorization'] = 'Bearer $token';
    final req = http.Request(method, uri);
    req.headers.addAll(headers);
    final streamed = await req.send();
    final res = await http.Response.fromStream(streamed);
    final parsed = res.body.isEmpty ? <String, dynamic>{} : jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw Exception(parsed['error'] ?? 'HTTP ${res.statusCode}');
    }
    if (parsed['success'] == true) {
      final data = parsed['data'];
      if (data is List) return List<Map<String, dynamic>>.from(data.cast<Map>());
    }
    return [];
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) headers['Authorization'] = 'Bearer $token';
    final req = http.Request(method, uri);
    req.headers.addAll(headers);
    if (body != null) {
      req.body = jsonEncode(body);
    }
    final streamed = await req.send();
    final res = await http.Response.fromStream(streamed);
    final parsed = res.body.isEmpty ? <String, dynamic>{} : jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw Exception(parsed['error'] ?? 'HTTP ${res.statusCode}');
    }
    if (parsed['success'] == true) {
      return Map<String, dynamic>.from(parsed['data'] as Map? ?? {});
    }
    return parsed;
  }
}
