import axios from "axios"

//헤더 있는 인스턴스
export const user = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Authorization:
      localStorage.getItem("Authorization") === undefined
        ? ""
        : localStorage.getItem("Authorization"),
  },

  withCredentials: true,
})

//헤더 없는 인스턴스
export const guest = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {},
})

////////////////////////////////////// 인터셉터 시작
let isTokenRefresh = false

user.interceptors.response.use(
  function (response) {
    return response
  },
  async function (error) {
    const originalConfig = error?.config
    if (error?.response?.data?.status === "303 SEE_OTHER") {
      if (!isTokenRefresh) {
        isTokenRefresh = true
        try {
          // const reissue = await reFreshInstance.get(`/user/reissue`)
          const data = await axios({
            url: `https://boombiboombi.o-r.kr/user/reissue`,
            method: "GET",
            headers: {
              Refresh: localStorage.getItem("Refresh_Token"),
            },
          })

          const Access_Token = data?.headers.authorization
          localStorage.setItem("Authorization", Access_Token)

          window.location.reload()
          axios(originalConfig)
        } catch (error) {
          localStorage.removeItem("Authorization")
          localStorage.removeItem("Refresh_Token")
          localStorage.removeItem("nickName")
          alert("로그인이 만료되었습니다. 다시 로그인 해주세요.")
          window.location.replace("/login")
        }
      }
    }
    if (error.response.data.status === "401 UNAUTHORIZED") {
      localStorage.removeItem("Authorization")
      localStorage.removeItem("Refresh_Token")
      localStorage.removeItem("nickName")
      alert("로그인이 필요한 페이지입니다. 다시 로그인 해주세요.")
      window.location.replace("/login")
    }
    return Promise.reject(error)
  }
)
///////////////////////////////// 인터셉터 끝

// //카카오 탈퇴 인스턴스
// export const kakaoinstance = axios.create({
//   baseURL: "https://kapi.kakao.com",
//   headers: {
//     Authorization:
//       localStorage.getItem("Authorization") === undefined
//         ? ""
//         : localStorage.getItem("Authorization"),
//   },
//   withCredentials: true,
// })

//채팅 API
export const chatApis = {
  //수락버튼
  // complete: (complete) => user.put(`/room/${complete}`),

  //채팅방 나가기
  leaveRoom: (roomID) => user.put(`/room/${roomID}`),

  //채팅방 생성
  CreateRoom: (createRoom) => user.post(`/room`, createRoom),

  //채팅방 목록 조회
  getRoomList: () => user.get(`/myrooms`),

  //채팅방 입장
  getInitialChatList: (roomID) => user.get(`/room/${roomID}`),

  //채팅방 입장
  getInitialChatList2: (roomID) => user.get(`/room/${roomID}`),
}

//실시간 알림 API
export const notificationApis = {
  //수락버튼
  getNotificationAX: (complete) => user.put(`/room/${complete}`),
}

export const membersApis = {
  //로컬용 테스트로그인
  testloginAX: () => guest.get("https://boombiboombi.o-r.kr/user/tester"),

  //토큰 재발급
  reIssueToken: () => reFresuser.get(`/user/reissue`),

  //카카오 로그인
  kakaologinAX: (code) => guest.get(`/user/signin/kakao?code=${code}`),

  //로그아웃 서버통신
  logoutAX: () => user.delete(`/api/logout`),

  //회원탈퇴
  deleteAccountAX: () => user.get(`/api/signout`),

  //네이버 로그인
  naverloginAX: (loginData) =>
    guest.get(
      `/user/signin/naver?code=${loginData.code}&state=${loginData.state}`
    ),
  //중복확인
  duplicateName: () => user.get(`/api/namecheck`),
}

export const commentApis = {
  //댓글 작성

  commentAddAX: (commentInfo) =>
    user.post(`/api/comments/${commentInfo.commentLevel}`, commentInfo),

  //댓글 삭제
  commentDeletePostAX: (id) => user.delete(`/api/comments/${id}`),
}

export const contentsApis = {
  //게시글 작성
  insertContentAX: (contentInfo) => user.post(`/api/posts`, contentInfo),

  //게시글 작성 시 구별 태그 get
  getGuTags: (gu) => user.get(`api/posts/tags`, { params: { gu: gu } }),

  //게시글 수정
  updateContentAX: (payload) =>
    user.put(`/api/posts/${payload.id}`, payload.obj),

  //컨텐츠 삭제
  deleteContentAX: (data) => user.delete(`/api/posts/${data.postId}`),

  //신고하기
  reportContentAX: (data) => user.post(`/api/report`, data),

  //게시글 전체 조회(Hot/인기순)(contentInfo안에 ✅gu / ✅hot이 객체로 들어감)
  //게시글 전체 조회(New/최신순)(contentInfo안에 ✅gu / 🙏sort가 객체로 들어감)
  getContentAX: (obj) =>
    user.get(`/api/posts`, {
      params: {
        gu: obj.gu,
        sort: obj.sort,
        category: obj.category,
        page: obj.page,
      },
    }),
  // {
  //   let decode = decodeURI(decodeURIComponent(obj.gu))
  //   user.get(`/api/posts?gu=${decode}&sort=${obj.sort}`)
  // },
  //검색

  searchAX: (obj) =>
    user.get(`api/posts/search`, {
      params: {
        type: obj.type,
        searchWord: obj.searchWord,
        sort: obj.sort,
        page: obj.page,
      },
    }),
  // user.get(`api/posts/search`, {
  //   params: `{ type= ${obj.type}&searchWord=${obj.searchWord}&sort= ${obj.sort}&page=${obj.page}`,
  // }),
  // user.get(`api/posts/search?type=${obj.type}&searchWord=${obj.searchWord}&sort= ${obj.sort}&page=${obj.page}`,
  // ),

  //핫태그
  hotTagAX: (gu) => user.get(`/api/posts/hottag`, { params: { gu: gu } }),

  //게시글 상세 조회
  getContentDetailAX: (postId) => user.get(`/api/posts/${postId}`),

  //게시글 좋아요
  postlikesAX: (postId) => user.get(`/api/posts/likes/${postId}`),

  //마이페이지 내가 작성한 글
  getmypageAX: () => user.get(`/api/myposts`),

  //마이페이지 수정
  modifyAX: (data) => user.put(`/api/myinfo`, data),

  //   (👎미정)마이페이지 좋아요
  mypageLikedAX: () => user.get(`/api/mylikes`),

  // 마이페이지 알림탭
  mypageNoticeAX: () => user.get(`api/alarm`),

  // 마이페이지 알림 확인완료
  mypageNoticeConfirmAX: (commentId) => user.post(`api/alarm/${commentId}`),

  //북마크
  bookMarkAX: (gu) => user.post(`/api/bookmarks/${gu}`),

  //북마크 반환
  returnBookMarkAX: () => user.get(`api/mybookmarks`),

  //북마크 취소
  bookMarkOffAX: (gu) => user.delete(`/api/bookmarks/${gu}`),

  //좋아요
  likesAX: (postInfo) =>
    user.put(`/api/likes?level=${postInfo.level}&id=${postInfo.postId}`),

  //좋아요 취소

  cancelLikesAX: (postInfo) =>
    user.put(`/api/likes?level=${postInfo.level}&id=${postInfo.postId}`),

  // 지역구별 정보
  infoAX: (gu) =>
    guest.get(`/api/guinfo`, {
      params: { gu: gu },
    }),

  infoAX2: (gu) =>
    user.get(`/api/guinfo`, {
      params: { gu: gu },
    }),

  // 홈 정보
  homeInfoAX: () => user.get(`api/maininfo`),
}
