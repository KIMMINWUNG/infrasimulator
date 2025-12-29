# 🚀 배포 가이드 - upgradeinfra

## 📋 준비 완료된 사항

✅ **기존 git 정보 정리 완료**  
✅ **프로젝트 설정 업데이트 완료**  
✅ **새로운 배포 파일 준비 완료**

## 🔧 변경된 설정

### 1. package.json
- **name**: `infra-fianl-simulator` → `upgradeinfra`
- **version**: `0.0.0` → `2.0.0`

### 2. 새로 추가된 파일들
- `README.md` - 새로운 프로젝트 설명서
- `netlify.toml` - Netlify 배포 설정
- `.gitignore` - Git 무시 파일 목록
- `env.example` - 환경 변수 예시

## 🚀 배포 명령어

Git이 설치되어 있다면 다음 명령어를 순서대로 실행하세요:

```bash
# 1. README.md 파일 생성 (이미 완료됨)
echo "# upgradeinfra" >> README.md

# 2. Git 초기화
git init

# 3. 파일 추가
git add README.md

# 4. 첫 커밋
git commit -m "first commit"

# 5. 메인 브랜치 설정
git branch -M main

# 6. 원격 저장소 연결
git remote add origin https://github.com/KIMMINWUNG/upgradeinfra.git

# 7. 푸시
git push -u origin main
```

## ⚠️ 주의사항

1. **Git 설치 필요**: 위 명령어들은 Git이 설치되어 있어야 합니다.
2. **GitHub 인증**: 첫 푸시 시 GitHub 계정 인증이 필요할 수 있습니다.
3. **모든 파일 추가**: 현재는 README.md만 추가되어 있으므로, 필요시 다음 명령어로 모든 파일을 추가하세요:
   ```bash
   git add .
   git commit -m "Add complete simulator project"
   git push
   ```

## 🌐 Netlify 배포 설정

### 1. Netlify 연결
1. [Netlify](https://netlify.com) 접속
2. "New site from Git" 클릭
3. GitHub 저장소 `upgradeinfra` 선택

### 2. 빌드 설정
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 3. 환경 변수 설정
Netlify 대시보드에서 다음 환경 변수를 추가하세요:
```
VITE_MASTER_KEY = your_secure_key_here
```

## 📱 배포 후 확인사항

- [ ] 웹사이트 정상 접속 확인
- [ ] 파일 업로드 기능 테스트
- [ ] 점수 계산 기능 테스트
- [ ] 다운로드 기능 테스트
- [ ] 관리자 모드 테스트

## 🔄 향후 업데이트 방법

```bash
# 로컬에서 변경사항 수정 후
git add .
git commit -m "Update: 설명"
git push origin main
```

Netlify가 자동으로 새 버전을 배포합니다.

---

**배포 준비 완료!** 🎉





