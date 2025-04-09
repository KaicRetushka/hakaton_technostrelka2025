function changePw(event) {
    const status = event.detail.xhr.status

    if(status === 200){
        location.href = '/edit_profile'
    } else {
        alert('Введен неправильный пароль')
    }
}


document.getElementById('change_pw_form').addEventListener('htmx:beforeRequest', (event) => {
    const newPassword1 = document.getElementById('input_new_pw_1').value;
    const newPassword2 = document.getElementById('input_new_pw_2').value;

    if (newPassword1 !== newPassword2) {
        alert('Новые пароли не совпадают');
        event.preventDefault(); // Отменить отправку запроса
    }
})


let btn_check_pw = document.querySelector('#btn_check_pw')
let input_old_pw = document.querySelector('#input_old_pw')
let input_new_pw_1 = document.querySelector('#input_new_pw_1')
let input_new_pw_2 = document.querySelector('#input_new_pw_2')
let proverka = false

btn_check_pw.addEventListener('click', () => {
    if(proverka === false){
        input_old_pw.type = 'text'
        input_new_pw_1.type = 'text'
        input_new_pw_2.type = 'text'
        btn_check_pw.innerHTML = 'Скрыть пароль'
        proverka = true
    } else {
        input_old_pw.type = 'password'
        input_new_pw_1.type = 'password'
        input_new_pw_2.type = 'password'
        btn_check_pw.innerHTML = 'Показать пароль'
        proverka = false
    }
})
