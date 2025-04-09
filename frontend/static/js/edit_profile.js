console.log('asdasd')

function changeInfo(event) {
    const status = event.detail.xhr.status

    console.log('Что не так')
    if(status === 200){
        location.href = '/'
        console.log('Изменения успешно сохранены')
    } else {
        alert('Что-то пошло не так')
    }
}


let img_avatar = document.querySelector('#img_avatar')
const dobav_foto = document.querySelector('#dobav_foto')

function myFunc() {
    var files = dobav_foto.files || dobav_foto.currentTarget.files;
    var reader = [];


    reader[0] = new FileReader();
    reader[0].readAsDataURL(files[0]);

    img_avatar.src = ''; // Изначально пустой src

    // Устанавливаем обработчик onload
    reader[0].onload = function (e) {
        console.log(document.getElementById('img_avatar'));
        img_avatar.src = e.target.result; // Устанавливаем src для изображения
    };

    console.log('ФАЙЛЫ КОТОРЫЕ МЫ ВЫБРАЛИ: ',files[0]);

}

dobav_foto.addEventListener('change', () => {
    myFunc();
})