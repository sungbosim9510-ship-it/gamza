/**
 * 중고 거래 웹 서비스 '감자 (Gamza)' - Core JavaScript with Supabase Auth & DB Integration
 */

// 0. Supabase 클라이언트 설정 및 유저 상태 관리
const SUPABASE_URL = "https://qgvupsxqepjgaoasfoqa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndnVwc3hxZXBqZ2FvYXNmb3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNDEzNDcsImV4cCI6MjEwNjgxNzM0N30.66eF2GdEl3ERHxxIJdHBtsdTGifQ_T2YvlkDC7Gs4CU";

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 사용자 로그인 및 프로필 상태 변수
let currentSession = null;
let currentUserProfile = null; // { id, nickname, profile_image_url, region, manner_temp }
let pendingActionAfterLogin = null; // 로그인 완료 후 처리할 대기 동작 ('openWriteModal' 등)

// 1. 초기 상품 데이터 (기본 6개 카드)
let products = [
  {
    id: 41,
    title: "아이패드 에어 5세대 M1 64GB Wi-Fi (스페이스 그레이)",
    category: "디지털 기기",
    price: 580000,
    location: "서울시 마포구 연남동",
    time: "10분 전",
    status: "판매중",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
    description: "작년에 구매하고 집에서 인강용으로만 사용해서 상태 아주 깨끗합니다.\n기스나 흠집 전혀 없으며, 강화유리 필름 붙여져 있습니다.\n정품 박스 및 케이블 모두 포함입니다.",
    seller: {
      id: "11111111-1111-1111-1111-111111111111",
      nickname: "감자도리",
      profileImg: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      region: "마포구 연남동",
      temp: "37.5℃ 🥔"
    }
  },
  {
    id: 42,
    title: "북유럽풍 원목 4인용 식탁 세트 (의자 4개 포함)",
    category: "가구/인테리어",
    price: 120000,
    location: "서울시 서초구 방배동",
    time: "45분 전",
    status: "예약중",
    image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80",
    description: "이사하게 되어 내놓습니다. 튼튼한 자작나무 원목입니다.\n상판에 생활 스크래치가 약간 있지만 전체적으로 양호해요.\n직접 가지러 오셔야 합니다 (엘리베이터 이용 가능).",
    seller: {
      id: "22222222-2222-2222-2222-222222222222",
      nickname: "알감자러버",
      profileImg: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      region: "서초구 방배동",
      temp: "41.2℃ 🥔"
    }
  },
  {
    id: 43,
    title: "파타고니아 신칠라 스냅티 플리스 자켓 L 사이즈",
    category: "의류",
    price: 85000,
    location: "경기도 성남시 분당구 정자동",
    time: "2시간 전",
    status: "판매중",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    description: "미국 직구로 구매했던 정품입니다. 한두 번 입고 보관 중입니다.\n오염이나 털 뭉침 없이 깨끗한 A급 상태입니다.\n택배 거래(3천원 추가)나 정자역 직거래 가능합니다.",
    seller: {
      id: "33333333-3333-3333-3333-333333333333",
      nickname: "강원도왕감자",
      profileImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      region: "분당구 정자동",
      temp: "36.8℃ 🥔"
    }
  },
  {
    id: 44,
    title: "발뮤다 더 토스터 K05B 스팀 토스트기 (블랙)",
    category: "생활가전",
    price: 130000,
    location: "서울시 송파구 잠실동",
    time: "5시간 전",
    status: "거래완료",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80",
    description: "겉바속촉 토스트로 정말 유명한 발뮤다 토스터입니다.\n내부 세척 및 소독 완료해두었습니다.\n정품 5cc 미니 컵도 함께 드립니다.",
    seller: {
      id: "44444444-4444-4444-4444-444444444444",
      nickname: "감자튀김좋아",
      profileImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      region: "송파구 잠실동",
      temp: "39.0℃ 🥔"
    }
  },
  {
    id: 45,
    title: "뮤지컬 <레미제라블> VIP석 연석 2매 팝니다",
    category: "도서/티켓",
    price: 240000,
    location: "서울시 종로구 대학로",
    time: "어제",
    status: "판매중",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80",
    description: "갑자기 일정이 생겨서 못 가게 되어 정가보다 저렴하게 팝니다.\n1층 8열 중앙 블록 연석입니다.\n현장 수령 또는 등기 발송 가능합니다.",
    seller: {
      id: "55555555-5555-5555-5555-555555555555",
      nickname: "휴게소알감자",
      profileImg: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      region: "종로구 대학로",
      temp: "36.5℃ 🥔"
    }
  },
  {
    id: 46,
    title: "닌텐도 스위치 OLED 한정판 + 젤다 야숨 팩 포함",
    category: "기타",
    price: 340000,
    location: "인천시 남동구 구월동",
    time: "3일 전",
    status: "판매중",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&auto=format&fit=crop&q=80",
    description: "액정 보호 필름 붙여져 있으며 잔상이나 쏠림 현상 전혀 없습니다.\n파우치 및 풀박스 세트입니다.\n직거래 구월동 로데오거리 희망합니다.",
    seller: {
      id: "66666666-6666-6666-6666-666666666666",
      nickname: "치즈감자",
      profileImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      region: "인천 남동구",
      temp: "38.2℃ 🥔"
    }
  }
];

// 상태 변수
let selectedCategory = "전체";
let searchQuery = "";
let onlyAvailable = false;
let currentDetailProduct = null;
let likedProducts = new Set();
let editingProductId = null;

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", async () => {
  initEventListeners();
  renderProducts(); // 6개 기본 카드 즉시 노출
  await initAuth();
  await loadProductsFromSupabase(); // Supabase 데이터 동기화
});

// 헬퍼: 상태 문자열 정규화 (공백 제거 후 산출)
function normalizeStatus(status) {
  if (!status) return "판매중";
  const s = String(status).replace(/\s+/g, '');
  if (s === "거래완료") return "거래완료";
  if (s === "예약중") return "예약중";
  return "판매중";
}

// ==========================================
// Auth & User Profile Functions
// ==========================================

async function initAuth() {
  if (!supabaseClient) return;

  // Supabase Auth 상태 변경 감지
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth event:", event, session);
    await handleAuthStateChange(session);
  });

  // 초기 로그인 세션 확인
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      await handleAuthStateChange(session);
    } else {
      updateHeaderAuthUI();
    }
  } catch (err) {
    console.error("Get session error:", err);
    updateHeaderAuthUI();
  }
}

async function handleAuthStateChange(session) {
  currentSession = session;

  if (session && session.user) {
    const profile = await ensureUserInDatabase(session.user);
    currentUserProfile = profile || {
      id: session.user.id,
      nickname: session.user.user_metadata?.nickname || session.user.email.split('@')[0] || "감자이웃",
      profile_image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      region: "마포구 연남동",
      manner_temp: 36.5
    };

    updateHeaderAuthUI();
    await loadLikedProductsFromSupabase();

    // 로그인 성공 후 대기 중이던 작업 수행 (예: 로그인 후 바로 글쓰기 창 열기)
    if (pendingActionAfterLogin === 'openWriteModal') {
      pendingActionAfterLogin = null;
      closeAuthModal();
      openWriteModal();
    }
  } else {
    currentUserProfile = null;
    updateHeaderAuthUI();
  }
}

async function ensureUserInDatabase(authUser, fallbackNickname) {
  if (!supabaseClient || !authUser) return null;

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!error && data) {
      return data;
    }

    const nicknameToUse = fallbackNickname || authUser.user_metadata?.nickname || authUser.email?.split('@')[0] || "감자이웃";
    const newProfile = {
      id: authUser.id,
      nickname: nicknameToUse,
      profile_image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      region: "마포구 연남동",
      manner_temp: 36.5
    };

    const { data: inserted, error: insertError } = await supabaseClient
      .from('users')
      .upsert([newProfile])
      .select()
      .single();

    if (insertError) {
      console.error("Upsert public.users error:", insertError);
      return newProfile;
    }

    return inserted;
  } catch (err) {
    console.error("ensureUserInDatabase exception:", err);
    return null;
  }
}

function updateHeaderAuthUI() {
  const btnHeaderLogin = document.getElementById("btnHeaderLogin");
  const userProfileGroup = document.getElementById("userProfileGroup");
  const headerUserNickname = document.getElementById("headerUserNickname");

  if (currentUserProfile) {
    if (btnHeaderLogin) btnHeaderLogin.style.display = "none";
    if (userProfileGroup) userProfileGroup.style.display = "flex";
    if (headerUserNickname) headerUserNickname.textContent = `🥔 ${currentUserProfile.nickname}`;
  } else {
    if (btnHeaderLogin) btnHeaderLogin.style.display = "inline-flex";
    if (userProfileGroup) userProfileGroup.style.display = "none";
  }
}

function openAuthModal(tab = 'login') {
  switchAuthTab(tab);
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function switchAuthTab(tab) {
  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabSignupBtn = document.getElementById("tabSignupBtn");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (tab === 'login') {
    if (tabLoginBtn) tabLoginBtn.classList.add("active");
    if (tabSignupBtn) tabSignupBtn.classList.remove("active");
    if (loginForm) loginForm.style.display = "flex";
    if (signupForm) signupForm.style.display = "none";
  } else {
    if (tabSignupBtn) tabSignupBtn.classList.add("active");
    if (tabLoginBtn) tabLoginBtn.classList.remove("active");
    if (signupForm) signupForm.style.display = "flex";
    if (loginForm) loginForm.style.display = "none";
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  const submitBtn = document.getElementById("btnSubmitLogin");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert("로그인 실패: " + (error.message.includes("Invalid login credentials") ? "이메일 또는 비밀번호가 올바르지 않습니다." : error.message));
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (data.session) {
      await handleAuthStateChange(data.session);
    }
    closeAuthModal();
    showToast(`🎉 로그인 성공! 환영합니다 🥔`);
  } catch (err) {
    console.error("Login exception:", err);
    alert("로그인 처리 중 오류가 발생했습니다.");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const nickname = document.getElementById("signupNickname").value.trim();

  if (!email || !password || !nickname) {
    alert("이메일, 비밀번호, 닉네임을 모두 입력해주세요.");
    return;
  }

  if (password.length < 6) {
    alert("비밀번호는 6자리 이상이어야 합니다.");
    return;
  }

  const submitBtn = document.getElementById("btnSubmitSignup");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { nickname: nickname }
      }
    });

    if (error) {
      alert("회원가입 실패: " + error.message);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (data.user) {
      await ensureUserInDatabase(data.user, nickname);

      if (data.session) {
        await handleAuthStateChange(data.session);
        closeAuthModal();
        showToast(`🎉 회원가입 성공! ${nickname}님 환영합니다.`);
      } else {
        // 자동 로그인 시도
        const { data: loginData } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (loginData?.session) {
          await handleAuthStateChange(loginData.session);
          closeAuthModal();
          showToast(`🎉 회원가입 및 로그인 성공! ${nickname}님 환영합니다.`);
        } else {
          closeAuthModal();
          showToast(`🎉 회원가입이 완료되었습니다. 로그인해 주세요!`);
        }
      }
    }
  } catch (err) {
    console.error("Signup exception:", err);
    alert("회원가입 처리 중 오류가 발생했습니다.");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleLogout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentSession = null;
  currentUserProfile = null;
  updateHeaderAuthUI();
  showToast("로그아웃 되었습니다. 🥔");
}

// ==========================================
// 2. Supabase 데이터 로드 함수
// ==========================================

async function loadProductsFromSupabase() {
  if (!supabaseClient) {
    console.warn("Supabase client not initialized.");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*, seller:users!seller_id(id, nickname, profile_image_url, region, manner_temp)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase load error:", error);
      return;
    }

    if (data && data.length > 0) {
      products = data.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        price: item.price,
        location: item.location,
        time: formatRelativeTime(item.created_at),
        status: normalizeStatus(item.status),
        image: item.image_url || "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
        description: item.description,
        seller: {
          id: item.seller?.id,
          nickname: item.seller?.nickname || "알수없음",
          profileImg: item.seller?.profile_image_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          region: item.seller?.region || item.location,
          temp: item.seller?.manner_temp ? (item.seller.manner_temp + "℃ 🥔") : "36.5℃ 🥔"
        }
      }));
    }

    await loadLikedProductsFromSupabase();
    renderProducts();
  } catch (err) {
    console.error("Supabase load exception:", err);
  }
}

async function loadLikedProductsFromSupabase() {
  if (!supabaseClient || !currentUserProfile) {
    likedProducts = new Set();
    return;
  }
  try {
    const { data, error } = await supabaseClient
      .from('product_likes')
      .select('product_id')
      .eq('user_id', currentUserProfile.id);

    if (!error && data) {
      likedProducts = new Set(data.map(item => String(item.product_id)));
    }
  } catch (err) {
    console.error("Load likes error:", err);
  }
}

// ==========================================
// 3. 이벤트 리스너 등록
// ==========================================

function initEventListeners() {
  // 카테고리 버튼 클릭
  const categoryBtns = document.querySelectorAll(".category-btn");
  categoryBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      categoryBtns.forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      selectedCategory = e.currentTarget.dataset.category || "전체";
      renderProducts();
    });
  });

  // 검색창 입력
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  // 거래 가능만 보기 토글
  const availableOnlyCheck = document.getElementById("availableOnlyCheck");
  if (availableOnlyCheck) {
    availableOnlyCheck.addEventListener("change", (e) => {
      onlyAvailable = e.target.checked;
      renderProducts();
    });
  }

  // 모달 닫기 버튼들 & 오버레이 클릭
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeDetailModal();
      closeWriteModal();
      closeAuthModal();
    });
  });

  const detailModal = document.getElementById("detailModal");
  if (detailModal) {
    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
  }

  const writeModal = document.getElementById("writeModal");
  if (writeModal) {
    writeModal.addEventListener("click", (e) => {
      if (e.target === writeModal) closeWriteModal();
    });
  }

  const authModal = document.getElementById("authModal");
  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Auth 탭 & 폼 이벤트
  const tabLoginBtn = document.getElementById("tabLoginBtn");
  if (tabLoginBtn) tabLoginBtn.addEventListener("click", () => switchAuthTab('login'));

  const tabSignupBtn = document.getElementById("tabSignupBtn");
  if (tabSignupBtn) tabSignupBtn.addEventListener("click", () => switchAuthTab('signup'));

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);

  const signupForm = document.getElementById("signupForm");
  if (signupForm) signupForm.addEventListener("submit", handleSignupSubmit);

  // 헤더 글쓰기 버튼 클릭 이벤트 (로그인 미완료 시 로그인 모달 전환)
  const btnHeaderWrite = document.getElementById("btnHeaderWrite");
  if (btnHeaderWrite) {
    btnHeaderWrite.addEventListener("click", (e) => {
      e.preventDefault();
      if (!currentUserProfile) {
        pendingActionAfterLogin = 'openWriteModal';
        showToast("🔒 글쓰기를 하려면 먼저 로그인해 주세요.");
        openAuthModal('login');
      } else {
        openWriteModal();
      }
    });
  }

  // 헤더 로그인 버튼 클릭
  const btnHeaderLogin = document.getElementById("btnHeaderLogin");
  if (btnHeaderLogin) {
    btnHeaderLogin.addEventListener("click", () => {
      pendingActionAfterLogin = null;
      openAuthModal('login');
    });
  }

  // 헤더 로그아웃 버튼 클릭
  const btnHeaderLogout = document.getElementById("btnHeaderLogout");
  if (btnHeaderLogout) {
    btnHeaderLogout.addEventListener("click", () => {
      handleLogout();
    });
  }

  // 상세 모달 하단 관심 버튼
  const btnLike = document.getElementById("btnLike");
  if (btnLike) {
    btnLike.addEventListener("click", toggleLike);
  }

  // 상세 모달 하단 채팅 버튼
  const btnChat = document.getElementById("btnChat");
  if (btnChat) {
    btnChat.addEventListener("click", async () => {
      if (!currentDetailProduct) return;
      if (!currentUserProfile) {
        showToast("🔒 채팅을 위해 먼저 로그인해 주세요.");
        openAuthModal('login');
        return;
      }

      if (supabaseClient && currentDetailProduct.seller?.id) {
        try {
          await supabaseClient
            .from('chat_rooms')
            .insert([{
              product_id: currentDetailProduct.id,
              buyer_id: currentUserProfile.id,
              seller_id: currentDetailProduct.seller.id
            }]);
        } catch (err) {
          console.log("Chat room notice:", err);
        }
      }
      showToast("💬 " + (currentDetailProduct.seller ? currentDetailProduct.seller.nickname : "") + "님과의 1:1 채팅방이 생성되었습니다!");
    });
  }

  // 작성자 거래 상태 변경 버튼 이벤트
  document.querySelectorAll(".btn-status-option").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const status = e.currentTarget.dataset.status;
      handleStatusChange(status);
    });
  });

  // 작성자 수정 버튼
  const btnEditProduct = document.getElementById("btnEditProduct");
  if (btnEditProduct) {
    btnEditProduct.addEventListener("click", handleEditProduct);
  }

  // 작성자 삭제 버튼
  const btnDeleteProduct = document.getElementById("btnDeleteProduct");
  if (btnDeleteProduct) {
    btnDeleteProduct.addEventListener("click", handleDeleteProduct);
  }

  // 글쓰기 이미지 미리보기
  const writeImgUrl = document.getElementById("writeImgUrl");
  const writeImgFile = document.getElementById("writeImgFile");
  if (writeImgUrl) {
    writeImgUrl.addEventListener("input", updateWriteImagePreview);
  }
  if (writeImgFile) {
    writeImgFile.addEventListener("change", handleFileSelect);
  }

  // 글자 수 제한 (500자)
  const writeDescription = document.getElementById("writeDescription");
  const descCharCount = document.getElementById("descCharCount");
  if (writeDescription) {
    writeDescription.addEventListener("input", () => {
      if (writeDescription.value.length > 500) {
        writeDescription.value = writeDescription.value.slice(0, 500);
      }
      if (descCharCount) {
        descCharCount.textContent = writeDescription.value.length;
      }
    });
  }

  // 글쓰기 폼 제출
  const writeForm = document.getElementById("writeForm");
  if (writeForm) {
    writeForm.addEventListener("submit", handleWriteSubmit);
  }
}

// ==========================================
// 4. 상품 목록 필터링 및 렌더링
// ==========================================

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const productCountText = document.getElementById("productCountText");
  if (!grid) return;

  const filtered = products.filter(p => {
    const normStatus = normalizeStatus(p.status);
    if (selectedCategory !== "전체" && p.category !== selectedCategory) {
      return false;
    }
    if (onlyAvailable && normStatus === "거래완료") {
      return false;
    }
    if (searchQuery) {
      const titleMatch = p.title.toLowerCase().includes(searchQuery);
      const locMatch = p.location.toLowerCase().includes(searchQuery);
      const catMatch = p.category.toLowerCase().includes(searchQuery);
      if (!titleMatch && !locMatch && !catMatch) return false;
    }
    return true;
  });

  if (productCountText) {
    productCountText.textContent = filtered.length;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🥔</div>
        <div class="no-results-text">조건에 맞는 상품이 없습니다.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const normStatus = normalizeStatus(product.status);
    let statusEng = "selling";
    if (normStatus === "예약중") statusEng = "reserved";
    if (normStatus === "거래완료") statusEng = "completed";

    const isCompleted = normStatus === "거래완료";

    return `
      <div class="product-card ${isCompleted ? 'completed' : ''}" data-id="${product.id}" onclick="openDetailModal('${product.id}')">
        <div class="card-image-wrapper">
          <img class="card-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Gamza+Product';">
          <span class="status-badge ${normStatus} ${statusEng}">${escapeHtml(normStatus)}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(product.title)}</h3>
          <div class="card-meta">
            <span>${escapeHtml(product.location)}</span>
            <span>•</span>
            <span>${escapeHtml(product.time)}</span>
          </div>
          <div class="card-seller-nickname">
            <span>🙋 ${escapeHtml(product.seller?.nickname || '알수없음')}</span>
          </div>
          <div class="card-price">${product.price.toLocaleString()}원</div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 5. 상세 보기 모달 오픈
// ==========================================

function openDetailModal(productId) {
  const product = products.find(p => String(p.id) === String(productId));
  if (!product) {
    console.error("Product not found for id:", productId);
    return;
  }

  currentDetailProduct = product;
  const normStatus = normalizeStatus(product.status);

  let statusEng = "selling";
  if (normStatus === "예약중") statusEng = "reserved";
  if (normStatus === "거래완료") statusEng = "completed";

  document.getElementById("detailImage").src = product.image;
  document.getElementById("detailImage").alt = product.title;
  
  const statusBadge = document.getElementById("detailStatusBadge");
  if (statusBadge) {
    statusBadge.className = `status-badge ${normStatus} ${statusEng}`;
    statusBadge.textContent = normStatus;
  }

  document.getElementById("detailCategory").textContent = product.category;
  document.getElementById("detailTitle").textContent = product.title;
  document.getElementById("detailLocation").textContent = product.location;
  document.getElementById("detailTime").textContent = product.time;
  document.getElementById("detailPrice").textContent = `${product.price.toLocaleString()}원`;
  document.getElementById("detailDescription").textContent = product.description;

  // 판매자 정보
  document.getElementById("sellerAvatar").src = product.seller?.profileImg || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
  document.getElementById("sellerNickname").textContent = product.seller?.nickname || "알수없음";
  document.getElementById("sellerRegion").textContent = product.seller?.region || product.location;
  document.getElementById("sellerTemp").textContent = product.seller?.temp || "36.5℃ 🥔";

  // 작성자 확인
  const isOwner = currentUserProfile && (
    (product.seller?.id && String(product.seller.id) === String(currentUserProfile.id)) ||
    (product.seller?.nickname && currentUserProfile.nickname && product.seller.nickname === currentUserProfile.nickname)
  );

  const ownerActionsGroup = document.getElementById("ownerActionsGroup");
  const btnChat = document.getElementById("btnChat");

  if (isOwner) {
    if (ownerActionsGroup) {
      ownerActionsGroup.style.display = "flex";
      updateStatusOptionButtons(normStatus);
    }
    if (btnChat) {
      btnChat.style.display = "none";
    }
  } else {
    if (ownerActionsGroup) {
      ownerActionsGroup.style.display = "none";
    }
    if (btnChat) {
      btnChat.style.display = "flex";
    }
  }

  // 관심 상태 반영
  const btnLike = document.getElementById("btnLike");
  if (btnLike) {
    if (likedProducts.has(String(product.id))) {
      btnLike.classList.add("liked");
      btnLike.innerHTML = `❤️ 관심 취소`;
    } else {
      btnLike.classList.remove("liked");
      btnLike.innerHTML = `🤍 관심 추가`;
    }
  }

  const modal = document.getElementById("detailModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeDetailModal() {
  const modal = document.getElementById("detailModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// 작성자 전용 액션 함수들 (상태 변경, 수정, 삭제)
function updateStatusOptionButtons(activeStatus) {
  const statusBtns = document.querySelectorAll(".btn-status-option");
  statusBtns.forEach(btn => {
    if (normalizeStatus(btn.dataset.status) === activeStatus) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

async function handleStatusChange(newStatus) {
  if (!currentDetailProduct) return;
  const normStatus = normalizeStatus(newStatus);
  
  if (normalizeStatus(currentDetailProduct.status) === normStatus) return;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('products')
        .update({ status: normStatus })
        .eq('id', currentDetailProduct.id);

      if (error) {
        console.error("Status update error:", error);
        alert("상태 변경 실패: " + error.message);
        return;
      }
    } catch (err) {
      console.error("Status update exception:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
      return;
    }
  }

  // 메모리 객체 업데이트
  currentDetailProduct.status = normStatus;
  const prod = products.find(p => String(p.id) === String(currentDetailProduct.id));
  if (prod) {
    prod.status = normStatus;
  }

  // 상세 모달 UI 반영
  let statusEng = "selling";
  if (normStatus === "예약중") statusEng = "reserved";
  if (normStatus === "거래완료") statusEng = "completed";

  const statusBadge = document.getElementById("detailStatusBadge");
  if (statusBadge) {
    statusBadge.className = `status-badge ${normStatus} ${statusEng}`;
    statusBadge.textContent = normStatus;
  }
  updateStatusOptionButtons(normStatus);

  // 메인 카드의 상태 배지 및 흐림 처리 반영
  renderProducts();
  showToast(`🎉 거래 상태가 '${normStatus}'(으)로 변경되었습니다!`);
}

function handleEditProduct() {
  if (!currentDetailProduct) return;
  editingProductId = currentDetailProduct.id;
  closeDetailModal();
  openWriteModalForEdit(currentDetailProduct);
}

function openWriteModalForEdit(product) {
  const modal = document.getElementById("writeModal");
  if (!modal) return;

  const titleEl = document.getElementById("writeModalTitle");
  if (titleEl) titleEl.textContent = "🥔 게시글 수정";

  const submitBtn = document.querySelector(".btn-submit-write");
  if (submitBtn) submitBtn.textContent = "수정 완료";

  document.getElementById("writeTitle").value = product.title || "";
  document.getElementById("writeCategory").value = product.category || "디지털 기기";
  document.getElementById("writePrice").value = product.price || 0;
  document.getElementById("writeLocation").value = product.location || "";
  document.getElementById("writeDescription").value = product.description || "";

  const descCharCount = document.getElementById("descCharCount");
  if (descCharCount) descCharCount.textContent = (product.description || "").length;

  document.getElementById("writeImgUrl").value = product.image || "";
  updateWriteImagePreview();

  const normStatus = normalizeStatus(product.status);
  const statusRadio = document.querySelector(`input[name="writeStatus"][value="${normStatus}"]`);
  if (statusRadio) {
    statusRadio.checked = true;
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

async function handleDeleteProduct() {
  if (!currentDetailProduct) return;

  if (!confirm(`'${currentDetailProduct.title}' 게시글을 정말 삭제하시겠습니까?`)) {
    return;
  }

  const targetId = currentDetailProduct.id;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', targetId);

      if (error) {
        console.error("Delete product error:", error);
        alert("게시글 삭제 실패: " + error.message);
        return;
      }
    } catch (err) {
      console.error("Delete product exception:", err);
      alert("게시글 삭제 처리 중 오류가 발생했습니다.");
      return;
    }
  }

  products = products.filter(p => String(p.id) !== String(targetId));
  closeDetailModal();
  renderProducts();
  showToast("🗑️ 게시글이 삭제되었습니다.");
}

// 관심 토글
async function toggleLike() {
  if (!currentDetailProduct) return;
  if (!currentUserProfile) {
    showToast("🔒 관심 상품 등록을 위해 먼저 로그인해 주세요.");
    openAuthModal('login');
    return;
  }

  const btnLike = document.getElementById("btnLike");
  const idStr = String(currentDetailProduct.id);

  if (likedProducts.has(idStr)) {
    likedProducts.delete(idStr);
    if (btnLike) {
      btnLike.classList.remove("liked");
      btnLike.innerHTML = `🤍 관심 추가`;
    }
    showToast("관심 상품에서 삭제되었습니다.");

    if (supabaseClient) {
      await supabaseClient
        .from('product_likes')
        .delete()
        .match({ user_id: currentUserProfile.id, product_id: currentDetailProduct.id });
    }
  } else {
    likedProducts.add(idStr);
    if (btnLike) {
      btnLike.classList.add("liked");
      btnLike.innerHTML = `❤️ 관심 취소`;
    }
    showToast("관심 상품에 추가되었습니다! 🥔");

    if (supabaseClient) {
      await supabaseClient
        .from('product_likes')
        .insert([{ user_id: currentUserProfile.id, product_id: currentDetailProduct.id }]);
    }
  }
}

// ==========================================
// 6. 글쓰기 모달 오픈 및 Supabase 등록/수정
// ==========================================

function openWriteModal() {
  if (!currentUserProfile) {
    pendingActionAfterLogin = 'openWriteModal';
    showToast("🔒 글쓰기를 하려면 먼저 로그인해 주세요.");
    openAuthModal('login');
    return;
  }

  editingProductId = null;
  const titleEl = document.getElementById("writeModalTitle");
  if (titleEl) titleEl.textContent = "🥔 내 물건 팔기";

  const submitBtn = document.querySelector(".btn-submit-write");
  if (submitBtn) submitBtn.textContent = "작성 완료";

  const modal = document.getElementById("writeModal");
  if (modal) {
    resetWriteForm();
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  } else {
    console.error("writeModal element not found");
  }
}

function closeWriteModal() {
  editingProductId = null;
  const modal = document.getElementById("writeModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function resetWriteForm() {
  const form = document.getElementById("writeForm");
  if (form) form.reset();
  const preview = document.getElementById("imagePreview");
  if (preview) {
    preview.innerHTML = `<span class="image-preview-placeholder">이미지 URL을 입력하거나 파일 선택 시<br>미리보기가 표시됩니다.</span>`;
  }
  const descCharCount = document.getElementById("descCharCount");
  if (descCharCount) {
    descCharCount.textContent = "0";
  }
}

function updateWriteImagePreview() {
  const url = document.getElementById("writeImgUrl").value.trim();
  const preview = document.getElementById("imagePreview");
  if (url) {
    preview.innerHTML = `<img src="${escapeHtml(url)}" class="image-preview-img" onerror="this.src='https://via.placeholder.com/400x300?text=Invalid+Image+URL'">`;
  } else {
    preview.innerHTML = `<span class="image-preview-placeholder">이미지 URL을 입력하거나 파일 선택 시<br>미리보기가 표시됩니다.</span>`;
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  const preview = document.getElementById("imagePreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      preview.innerHTML = `<img src="${event.target.result}" class="image-preview-img">`;
      document.getElementById("writeImgUrl").value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

async function handleWriteSubmit(e) {
  e.preventDefault();

  if (!currentUserProfile) {
    alert("로그인이 필요합니다.");
    openAuthModal('login');
    return;
  }

  const title = document.getElementById("writeTitle").value.trim();
  const category = document.getElementById("writeCategory").value;
  const price = parseInt(document.getElementById("writePrice").value, 10);
  const location = document.getElementById("writeLocation").value.trim();
  const status = document.querySelector('input[name="writeStatus"]:checked')?.value || "판매중";
  const description = document.getElementById("writeDescription").value.trim();
  let imgUrl = document.getElementById("writeImgUrl").value.trim();

  if (!title || isNaN(price) || !location || !description) {
    alert("필수 입력 사항을 모두 입력해주세요.");
    return;
  }

  if (description.length > 500) {
    alert("자세한 설명은 최대 500자까지 작성할 수 있습니다.");
    return;
  }

  if (!imgUrl) {
    imgUrl = "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80";
  }

  const submitBtn = document.querySelector(".btn-submit-write");
  if (submitBtn) submitBtn.disabled = true;

  const normStatus = normalizeStatus(status);

  if (editingProductId !== null) {
    // 수정 모드
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from('products')
        .update({
          title: title,
          category: category,
          price: price,
          location: location,
          status: normStatus,
          image_url: imgUrl,
          description: description
        })
        .eq('id', editingProductId);

      if (error) {
        console.error("Supabase 수정 오류:", error);
        alert("게시글 수정 실패: " + error.message);
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      await loadProductsFromSupabase();
    } else {
      const p = products.find(prod => String(prod.id) === String(editingProductId));
      if (p) {
        p.title = title;
        p.category = category;
        p.price = price;
        p.location = location;
        p.status = normStatus;
        p.image = imgUrl;
        p.description = description;
      }
      renderProducts();
    }

    editingProductId = null;
    if (submitBtn) submitBtn.disabled = false;
    closeWriteModal();
    showToast("🎉 게시글이 수정되었습니다!");
  } else {
    // 신규 등록 모드
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from('products')
        .insert([{
          seller_id: currentUserProfile.id,
          title: title,
          category: category,
          price: price,
          location: location,
          status: normStatus,
          image_url: imgUrl,
          description: description
        }]);

      if (error) {
        console.error("Supabase 저장 오류:", error);
        alert("Supabase 상품 등록 실패: " + error.message);
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      await loadProductsFromSupabase();
    } else {
      const newProduct = {
        id: Date.now(),
        title: title,
        category: category,
        price: price,
        location: location,
        time: "방금 전",
        status: normStatus,
        image: imgUrl,
        description: description,
        seller: {
          id: currentUserProfile.id,
          nickname: currentUserProfile.nickname,
          profileImg: currentUserProfile.profile_image_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          region: location,
          temp: "36.5℃ 🥔"
        }
      };
      products.unshift(newProduct);
      renderProducts();
    }

    if (submitBtn) submitBtn.disabled = false;
    closeWriteModal();
    showToast("🎉 새 상품이 등록되었습니다!");
  }
}

// ==========================================
// 7. 유틸리티 함수
// ==========================================

function formatRelativeTime(dateString) {
  if (!dateString) return "방금 전";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "방금 전";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "어제";
  if (diffDay < 30) return `${diffDay}일 전`;
  return date.toLocaleDateString();
}

function showToast(message) {
  let toast = document.getElementById("toastNotice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotice";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}