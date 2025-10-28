# 🎯 GIT QUICK REFERENCE - CHEAT SHEET

## ⚡ LỆNH THƯỜNG DÙNG NHẤT

### **XEM TRẠNG THÁI**
```bash
git status                    # Xem file nào đã sửa
git log --oneline -10         # Xem 10 commit gần nhất
git branch                    # Xem danh sách branch
```

### **BẮT ĐẦU NGÀY LÀM VIỆC MỚI**
```bash
git checkout -b feature/ten-tinh-nang    # Tạo branch mới
```

### **LƯU CÔNG VIỆC**
```bash
git add .                                # Thêm tất cả file
git commit -m "Mô tả thay đổi"          # Commit
```

### **KẾT THÚC NGÀY - MERGE VÀO MASTER**
```bash
git checkout master                      # Về master
git merge feature/ten-tinh-nang         # Merge tính năng vào
```

### **KHẨN CẤP - APP LỖI**
```bash
git checkout .                           # Bỏ tất cả thay đổi
git checkout master                      # Về phiên bản stable
```

---

## 📚 TẤT CẢ LỆNH GIT

### 🌿 **BRANCH (Nhánh)**

```bash
# Xem danh sách branch
git branch                              # Local branches
git branch -a                           # Tất cả branches (local + remote)

# Tạo branch mới
git branch ten-branch                   # Tạo mới (không chuyển)
git checkout -b ten-branch              # Tạo mới + chuyển sang luôn

# Chuyển branch
git checkout ten-branch                 # Chuyển sang branch
git switch ten-branch                   # Cách mới (Git 2.23+)

# Xóa branch
git branch -d ten-branch                # Xóa (an toàn)
git branch -D ten-branch                # Xóa (ép buộc)

# Đổi tên branch
git branch -m ten-moi                   # Đổi tên branch hiện tại
git branch -m ten-cu ten-moi            # Đổi tên branch khác
```

### 💾 **COMMIT (Lưu)**

```bash
# Thêm file vào staging
git add file.tsx                        # Thêm 1 file
git add .                               # Thêm tất cả
git add src/                            # Thêm 1 thư mục

# Commit
git commit -m "Message"                 # Commit với message
git commit -am "Message"                # Add + commit (file đã tracked)
git commit --amend                      # Sửa commit cuối

# Xem thay đổi trước khi commit
git diff                                # Thay đổi chưa staged
git diff --staged                       # Thay đổi đã staged
git diff file.tsx                       # Thay đổi trong 1 file
```

### 📜 **LỊCH SỬ**

```bash
# Xem lịch sử commit
git log                                 # Chi tiết
git log --oneline                       # Gọn (1 dòng/commit)
git log --oneline -10                   # 10 commit gần nhất
git log --graph                         # Dạng đồ thị
git log --all --graph --oneline         # Đầy đủ + đồ thị

# Xem chi tiết 1 commit
git show abc1234                        # Xem commit abc1234
git show HEAD                           # Xem commit hiện tại
git show HEAD~1                         # Xem commit trước 1
```

### 🔗 **MERGE & REBASE**

```bash
# Merge branch vào branch hiện tại
git merge ten-branch                    # Merge thường
git merge --no-ff ten-branch            # Merge giữ lịch sử

# Rebase (nâng cao)
git rebase master                       # Rebase lên master
git rebase --continue                   # Tiếp tục sau khi fix conflict
git rebase --abort                      # Hủy rebase
```

### ⏮️ **QUAY LẠI / HOÀN TÁC**

```bash
# Bỏ thay đổi chưa commit
git checkout .                          # Bỏ tất cả
git checkout file.tsx                   # Bỏ 1 file
git restore .                           # Cách mới (Git 2.23+)

# Unstage file (bỏ khỏi staging)
git reset file.tsx                      # Unstage 1 file
git reset                               # Unstage tất cả
git restore --staged file.tsx           # Cách mới

# Quay lại commit cũ
git reset --soft HEAD~1                 # Quay lại, giữ thay đổi
git reset --mixed HEAD~1                # Quay lại, unstage
git reset --hard HEAD~1                 # Quay lại, XÓA thay đổi
git reset --hard abc1234                # Quay về commit cụ thể

# Revert (tạo commit mới để hủy)
git revert abc1234                      # Hủy commit abc1234
git revert HEAD                         # Hủy commit cuối
```

### 💼 **STASH (Cất tạm)**

```bash
# Cất tạm thay đổi
git stash                               # Cất tạm
git stash save "Mô tả"                  # Cất tạm + mô tả

# Xem danh sách stash
git stash list                          # Liệt kê

# Lấy lại stash
git stash pop                           # Lấy stash cuối + xóa
git stash apply                         # Lấy stash cuối + giữ
git stash apply stash@{1}               # Lấy stash cụ thể

# Xóa stash
git stash drop                          # Xóa stash cuối
git stash clear                         # Xóa tất cả stash
```

### 📊 **XEM THÔNG TIN**

```bash
# Xem trạng thái
git status                              # Đầy đủ
git status -s                           # Gọn

# Xem thay đổi
git diff                                # Working dir vs Staging
git diff --staged                       # Staging vs Last commit
git diff HEAD                           # Working dir vs Last commit
git diff branch1 branch2                # So sánh 2 branch

# Xem branch hiện tại
git branch --show-current               # Tên branch hiện tại
git rev-parse --abbrev-ref HEAD         # Cách khác

# Xem remote
git remote -v                           # Danh sách remote
```

### 🔍 **TÌM KIẾM**

```bash
# Tìm trong lịch sử
git log --grep="từ khóa"                # Tìm trong commit message
git log -S"từ khóa"                     # Tìm trong code
git log --author="Tên"                  # Tìm theo tác giả

# Tìm ai sửa dòng nào
git blame file.tsx                      # Xem ai sửa từng dòng
```

### 🧹 **DỌN DẸP**

```bash
# Xóa file
git rm file.txt                         # Xóa file + stage
git rm --cached file.txt                # Bỏ track (giữ file)

# Dọn dẹp
git clean -n                            # Xem file nào sẽ bị xóa
git clean -f                            # Xóa untracked files
git clean -fd                           # Xóa cả folders
```

---

## 🆘 TÌNH HUỐNG KHẨN CẤP

### ❌ **App bị crash, không vào được!**
```bash
git log --oneline                       # Xem commit stable
git checkout abc1234                    # Quay lại commit stable
# Refresh browser → App hoạt động!
```

### ❌ **Sửa nhầm, muốn bỏ tất cả!**
```bash
git checkout .                          # Bỏ tất cả thay đổi
git clean -fd                           # Xóa file mới tạo
```

### ❌ **Commit nhầm, chưa push!**
```bash
git reset --soft HEAD~1                 # Hủy commit, giữ code
git reset --hard HEAD~1                 # Hủy commit + code
```

### ❌ **Đang làm dở, cần chuyển branch gấp!**
```bash
git stash save "Công việc dở"          # Cất tạm
git checkout branch-khac                # Chuyển branch
# ... làm việc khác ...
git checkout branch-cu                  # Quay lại
git stash pop                           # Lấy lại công việc
```

### ❌ **Merge bị conflict!**
```bash
# 1. Mở file conflict, sửa thủ công
# 2. Sau khi sửa xong:
git add .
git commit -m "Fix conflict"
# Hoặc hủy merge:
git merge --abort
```

---

## 💡 MẸO HAY

### **Alias (Lệnh tắt)**
```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# Giờ có thể dùng:
git st                                  # thay vì git status
git co master                           # thay vì git checkout master
```

### **Log đẹp**
```bash
git log --graph --oneline --decorate --all
# Alias cho lệnh trên:
git config --global alias.lg "log --graph --oneline --decorate --all"
# Dùng: git lg
```

### **Xem ai sửa file nhiều nhất**
```bash
git shortlog -sn file.tsx
```

### **Tìm commit làm hỏng tính năng**
```bash
git bisect start                        # Bắt đầu
git bisect bad                          # Commit hiện tại lỗi
git bisect good abc1234                 # Commit abc1234 OK
# Git sẽ tự động tìm commit gây lỗi
```

---

## 📋 WORKFLOW MẪU

### **1. Feature Development (Phát triển tính năng)**
```bash
# Ngày 1
git checkout -b feature/new-feature
# ... code ...
git add .
git commit -m "Add basic structure"

# Ngày 2
# ... code tiếp ...
git add .
git commit -m "Complete feature"

# Ngày 3 - Hoàn thành
git checkout master
git merge feature/new-feature
git branch -d feature/new-feature
```

### **2. Hotfix (Sửa lỗi gấp)**
```bash
git stash                               # Cất công việc dở
git checkout master
git checkout -b hotfix/fix-bug
# ... sửa bug ...
git add .
git commit -m "Fix critical bug"
git checkout master
git merge hotfix/fix-bug
git branch -d hotfix/fix-bug
git checkout feature/old-work
git stash pop                           # Tiếp tục công việc cũ
```

### **3. Experiment (Thử nghiệm)**
```bash
git checkout -b experiment/test-idea
# ... thử nghiệm ...
# Nếu thất bại:
git checkout master
git branch -D experiment/test-idea      # Xóa luôn
# Nếu thành công:
git checkout master
git merge experiment/test-idea
```

---

## 🎓 GHI NHỚ

### **3 Vùng trong Git:**
1. **Working Directory** - Nơi bạn làm việc
2. **Staging Area (Index)** - Chuẩn bị commit
3. **Repository (.git)** - Lưu trữ lịch sử

### **HEAD, HEAD~1, HEAD~2:**
- `HEAD` = Commit hiện tại
- `HEAD~1` = Commit trước 1
- `HEAD~2` = Commit trước 2
- `HEAD~n` = Commit trước n

### **--soft, --mixed, --hard:**
- `--soft` = Chỉ di chuyển HEAD (giữ staging + working)
- `--mixed` = Di chuyển HEAD + bỏ staging (giữ working) - **MẶC ĐỊNH**
- `--hard` = Xóa hết (staging + working) - **NGUY HIỂM!**

---

## ⚠️ CẢNH BÁO

### **LỆNH NGUY HIỂM - CẦN THẬN!**

```bash
git reset --hard                        # MẤT HẾT thay đổi!
git clean -fd                           # XÓA file chưa track!
git push --force                        # Ghi đè remote - NGUY HIỂM!
rm -rf .git                             # MẤT HẾT lịch sử!
```

**→ LUÔN KIỂM TRA KỸ TRƯỚC KHI DÙNG CÁC LỆNH TRÊN!**

---

*Cheat Sheet này được tạo cho Bếp An Huy Invoice System*
*Cập nhật: 28/10/2025*

