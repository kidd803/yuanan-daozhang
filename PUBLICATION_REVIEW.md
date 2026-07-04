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

- 保留文章標題、日期、分類、系列、標籤、內文與公開連結。
- 移除 Facebook 匯出的來源檔名與原始檔案路徑。
- 不附帶圖片與影片路徑，只保留原附件數量。
- 排除沒有文字的純媒體貼文。

## 建議

第一次上傳 GitHub 建議先用私人 repo 檢查；確認沒有要刪的文章後，再開 GitHub Pages。
