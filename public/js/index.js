/*************** 글로벌 설정 *****************/
var auth = firebase.auth(); //firtbase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider();// 구글 로그인 모듈을 불러온다.
var user = null;

/*************** 사용자 함수 *****************/


/*************** 이벤트 등록 *****************/
$('.bt-login').click(onLogin);
$('.bt-logout').click(onLogOut);
auth.onAuthStateChanged(onChangeAuth);

/*************** 이벤트 콜백 *****************/
function onChangeAuth(r) {
user = r;
console.log(user);
}

function onLogOut() {
	auth.signOut();
}

function onLogin() {
	auth.signInWithPopup(googleAuth);
}
