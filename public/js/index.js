/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.
var db = firebase.database(); //firebase의 database모듈을 불러온다.
var ref = db.ref('root/board');
var user = null;


var $tbody = $('.list-wrapper tbody');
var $form = $('.create-form');

/*************** 사용자 함수 *****************/
$tbody.empty();


/*************** 이벤트 등록 *****************/
auth.onAuthStateChanged(onChangeAuth);
ref.on('child_added', onAdded);
ref.on('child_removed', onRemoved);
ref.on('child_changed', onChanged);


$('.bt-login').click(onLogin);
$('.bt-logout').click(onLogOut);
$form.find('.bt-cancel').click(onReset);

/*************** 이벤트 콜백 *****************/
function onRemoved(r) {
	$('#' + r.key).remove();
}

function onChanged(r) {
	$('#' + r.key).find('.writer').text(r.val().writer);
	$('#' + r.key).find('.content > span').text(r.val().content);
	$('#' + r.key).find('.readnum').text(r.val().readnum);
	$('#' + r.key).find('.date').text(moment(r.val().updatedAt).fotmat('YYYY/MM/DD'));
}

function onAdded(r) {
	var k = r.key;
	var v = r.val();
	var i = $tbody.find('tr').length + 1;
	var html = '';
	html += '<tr class="id" id="'+k+'" data-uid="'+v.uid+'">';
	html += '<td>'+i;
	html += '</td>';
	html += '<td class="content text-left"><span>'+v.content+'</span>';
	html += '<div class="btn-group mask">';
	html += '<button class="bt-chg btn btn-sm btn-info"><i class="fa fa-edit"></i></button>';
	html += '<button class="bt-rev btn btn-sm btn-info"><i class="fa fa-trash-alt"></i></button>';
	html += '</div>';
	html += '</td>';
	html += '<td class="writer">'+v.writer+'</td>';
	html += '<td class="date">'+moment(v.createdAt).format('YYYY/MM/DD')+'</td>';
	html += '<td class="readnum">'+v.readnum+'</td>';
	html += '</tr>';
	var $tr = $(html).prependTo($tbody);
	$tr.mouseenter(onTrEnter);
	$tr.mouseleave(onTrLeave);
	$tr.find('.bt-chg').click(onChgClick);
	$tr.find('.bt-rev').click(onRevClick);
}

function onChgClick() {
	var key = $(this).parents('tr').attr('id');
	ref.child(key).get().then(function(r) {
		$form.find('[name="key"]').val(r.key);
		$form.find('[name="writer"]').val(r.val().writer);
		$form.find('[name="content"]').val(r.val().content);
		$form.find('.bt-create').hide();
		$form.find('.btn-group').show();
		$form.addClass('active');
	}).catch(function(err) {
		console.log(err);
	});
}

function onRevClick() {
	if(confirm('정말로 삭제하시겠습니까?')) {
		var key =	$(this).parents('tr').attr('id');
		ref.child(key).remove(); // 실제 firebase의 데이터 삭제
		/*
		삭제 로직
		1. db.ref('root/board/' + key).remove(); 
		2. db.ref('root/board/').on('child_removed', onREmoved); //실제 데이터가 삭제되면 이벤트가 실행
		3. function onRemoved(r) { r: 삭제된 데이터
			$('#' + r.key).remove(); //jQuery remove()
		}
		*/
	}
}

function onReset() {
	$form.find('[name="writer"]').val(user.displayName);
	$form.find('[name="content"]').val('');
	$form.find('[name="key"]').val('');
	$form.find('.bt-create').show();
	$form.find('.btn-group').hide();
	$form.removeClass('active');
}

function onTrEnter() {
	var uid = $(this).data('uid');
	if(user && uid === user.uid) {
		$(this).find('.mask').css('display', 'inline-block');
	}
}

function onTrLeave() {
	$(this).find('.mask').css('display', 'none');
}

function onResize() {
	var wid = $('.list-tb').innerWidth();
	$('.list-tb .mask').innerWidth(wid);
}

function onSubmit(f) {
	if(f.writer.value.trim() === '') {
		alert('작성자는 필수사항입니다.');
		f.writer.focus();
		return false;
	}
	if(f.content.value.trim() === '') {
		alert('한 줄 내용은 필수사항입니다.');
		f.content.focus();
		return false;
	}

	var data = { writer: f.writer.value, content: f.content.value }
	if(user && user.uid) {
		if(f.key.value === '') {
			data.createdAt = new Date().getTime();
			data.readnum = 0;
			data.uid = user.uid;
			ref.push(data);
		}
		else {
			data.updatedAt = new Date().getTime();
			ref.child(f.key.value).update(data);
		}		
	}
	else alert('정상적인 접근이 아닙니다.');




	$(f).removeClass('active');
	f.key.value = '';
	f.writer.value = uer.displayName;
	f.content.value = '';
	f.content.focus();
	
	return false;
}

function onChangeAuth(r) {
	user = r;
	if (user) {
		$('.header-wrapper .email').text(user.email);
		$('.header-wrapper .photo img').attr('src', user.photoURL);
		$('.header-wrapper .info-wrap').css('display', 'flex');
		$('.create-wrapper').show();
		$('.create-wrapper input[name="writer"]').val(user.displayName);
		$('.bt-login').hide();
		$('.bt-logout').show();
	} 
	else {
		$('.header-wrapper .email').text('');
		$('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333');
		$('.header-wrapper .info-wrap').css('display', 'none');
		$('.create-wrapper').hide();
		$('.create-wrapper input[name="writer"]').val('');
		$('.bt-login').show();
		$('.bt-logout').hide();
	}
}

function onLogOut() {
	auth.signOut();
}

function onLogin() {
	auth.signInWithPopup(googleAuth);
}

