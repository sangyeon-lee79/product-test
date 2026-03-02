const { test, expect } = require('@playwright/test');

test.describe('Global Language Conversion System v2', () => {
  test.beforeEach(async ({ page }) => {
    // Firebase Studio는 보통 3000번 포트에서 서비스를 미리보기 합니다.
    await page.goto('http://localhost:3000'); 
  });

  test('Admin can register master data with 13-lang conversion', async ({ page }) => {
    // 1. Role을 Admin으로 변경
    await page.selectOption('#role-selector', 'admin');
    
    // 2. 마스터 데이터 입력
    const input = 'New Breed Name';
    await page.fill('#admin-master-input', input);
    
    // 3. 번역 버튼 클릭
    await page.click('#admin-convert-btn');
    
    // 4. 번역 그리드가 나타나는지 확인
    const preview = page.locator('#admin-conversion-preview');
    await expect(preview).toBeVisible();
    
    // 5. 특정 언어(EN) 값이 올바른지 확인 (Mock 로직 검증)
    const enInput = page.locator('#admin-grid-items input[data-lang="en"]');
    await expect(enInput).toHaveValue(input + ' [EN]');
    
    // 6. 저장
    page.on('dialog', dialog => dialog.accept());
    await page.click('#save-admin-master-btn');
    
    // 7. 테이블에 추가되었는지 확인
    const lastRow = page.locator('#master-items-table .table-row').last();
    await expect(lastRow).toContainText(input);
  });

  test('Provider can register shop with language conversion', async ({ page }) => {
    // 1. Role을 Provider로 변경
    await page.selectOption('#role-selector', 'provider');
    
    // 2. 샵 이름 입력
    const shopName = 'Happy Paws Shop';
    await page.fill('#master-input', shopName);
    await page.click('#convert-btn');
    
    // 3. 그리드 확인 및 저장
    await expect(page.locator('#conversion-preview')).toBeVisible();
    page.on('dialog', dialog => dialog.accept());
    await page.click('#save-master-btn');
    
    // 4. User View로 돌아가서 피드 확인
    await page.selectOption('#role-selector', 'user');
    const shopTitle = page.locator('#timeline-feed h3').first();
    await expect(shopTitle).toContainText(shopName);
  });
});
