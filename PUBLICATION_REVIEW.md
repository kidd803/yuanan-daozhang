# 發布前檢查

這份公開版只包含圓安道長文章資料庫的靜態檔案。

## 已排除

- `facebook-archive/`
- `outputs/`
- `raw/`
- `*.zip`
- `*.log`
- `sales.html`
- `conversations.html`
- `sales-ledger`
- `conversations.js`

## 資料處理

- 保留文章標題、日期、系列、標籤、內文與公開連結。
- 文章分類重新整理為固定 10 類；原本的系列欄位保留為獨立篩選。
- 移除 Facebook 匯出的來源檔名與原始檔案路徑。
- 文字文章附帶圖片會複製到 `media/images/`，並以公開網站路徑引用。
- 影片不放入公開版，只保留在本機原始資料。
- 排除沒有文字的純媒體貼文。

## 建議

第一次上傳 GitHub 建議先用私人 repo 檢查；確認沒有要刪的文章後，再開 GitHub Pages。
