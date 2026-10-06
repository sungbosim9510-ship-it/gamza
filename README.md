# 🥔 감자 (Gamza)

> **이웃과 함께하는 신뢰 기반 중고 거래 웹 서비스**

![Gamza Project](도서%20사진.jpg)

## 📌 프로젝트 소개
'감자 (Gamza)'는 지역 이웃 간에 중고 물품을 안전하고 편리하게 거래할 수 있는 C2C 중고 거래 웹 애플리케이션입니다.

- **실시간 게시글 조회 및 필터링**: 카테고리별 검색, 거래 상태(판매중/예약중/거래완료) 필터링
- **상세 페이지 및 찜하기**: 관심 상품 등록, 판매자 프로필 및 매너 온도 확인
- **상품 등록 및 관리**: 이웃과의 중고 물품 작성 및 게시글 관리
- **Supabase 연동**: Supabase Auth 및 Database 기반 데이터 동기화

---

## 🛠️ 기술 스택 (Tech Stack)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage)
- **Local Dev Server**: PowerShell Script (`server.ps1`)

---

## 🚀 시작하기 (Getting Started)

### 1. 환경 변수 설정
`.env.example` 파일을 참고하여 `.ENV` 파일을 생성하고 Supabase 프로젝트 정보를 설정합니다.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 2. 로컬 서버 실행
PowerShell 환경에서 아래 명령어로 로컬 개발 서버를 시작할 수 있습니다.

```powershell
.\server.ps1
```
서버 실행 후 브라우저에서 `http://localhost:8000`으로 접속하세요.

---

## 📁 프로젝트 구조
```
Gamza/
├── index.html           # 메인 페이지 (SPA layout)
├── app.js               # 핵심 비즈니스 로직 및 Supabase 연동
├── styles.css           # 스타일시트
├── screen1_list.html    # 상품 목록 화면 템플릿
├── screen2_detail.html  # 상품 상세 화면 템플릿
├── screen3_write.html   # 상품 등록 화면 템플릿
├── server.ps1           # 로컬 HTTP 개발 서버 스크립트
├── run_seed.ps1         # 데이터베이스 시드 스크립트
└── .env.example         # 환경 변수 샘플
```

---

## 📄 라이선스
MIT License
