let showMark = document.querySelector('#show_mark_btn')
let btnAddMark = document.querySelector('#add_mark_btn')
let dialogAddMark = document.querySelector('#add_mark_dialog')
let btnAddMarkCancel = document.querySelector('#add_mark_cancel')
let btnAddMarkSave = document.querySelector('#add_mark_save')
let nameMark = document.querySelector('#name_mark_input')
let descriptionMark = document.querySelector('#description_mark_input')
let myMap
const photoMark = document.querySelector('#photo_mark_input')
const gallery = document.querySelector('#gallery')
function exitToTheGlav(event){
    const status = event.detail.xhr.status

    if (status === 200){
        location.reload()
    } else {
        alert('Произошла ошибка при выходе из аккаунта')
    }
}


function myFunc() {
    var files = photoMark.files || photoMark.currentTarget.files;
    var reader = [];
    
    // Очищаем галерею перед добавлением новых изображений
    gallery.innerHTML = '';

    for (let i = 0; i < files.length; i++) {

        reader[i] = new FileReader();
        reader[i].readAsDataURL(files[i]);
        
        // Создаем элемент изображения и добавляем его в галерею
        let imgElement = document.createElement('img');
        imgElement.id = name;
        imgElement.src = ''; // Изначально пустой src
        imgElement.style.width = '100px'
        imgElement.style.height = '100px'
        imgElement.style.margin = '15px'

        gallery.appendChild(imgElement); // Добавляем элемент в галерею

        // Устанавливаем обработчик onload
        reader[i].onload = function (e) {
            console.log(document.getElementById(name));
            imgElement.src = e.target.result; // Устанавливаем src для изображения
        };

        console.log(files[i]);
    }
}

photoMark.addEventListener("change", (event) => {
    myFunc()
})




ymaps.ready(function () {
    // Создаём карту
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],  // Москва
        zoom: 10
    });

    let isAddingMode = false; // Режим добавления метки

    // Включаем/выключаем режим добавления метки
    btnAddMark.addEventListener('click', () => {
        isAddingMode = !isAddingMode
        btnAddMark.textContent = isAddingMode ? "Отменить" : "Добавить метку"
    });

    // Обработчик клика по карте
    myMap.events.add('click', function (e) {
        if (!isAddingMode) return // Если режим выключен - ничего не делаем

        dialogAddMark.showModal() // Показываем окно только в режиме добавления

        btnAddMarkCancel.onclick = () => {
            dialogAddMark.close()
            isAddingMode = false // Отменяем режим
            btnAddMark.textContent = "Добавить метку"
        };

        btnAddMarkSave.onclick = () => {
            const coords = e.get('coords'); // Получаем координаты клика
            
            // Создаём метку
            const placemark = new ymaps.Placemark(
                coords,
                {
                    hintContent: nameMark.value
                },
                {
                    preset: "islands#blackDotIcon"
                }
            );

            let title = nameMark.value
            let description = descriptionMark.value

            addMark(title, coords, description)



            myMap.geoObjects.add(placemark)
            console.log(`Добавлена метка: ${nameMark.value} (${coords})`)

            // Сбрасываем форму и режим
            nameMark.value = ''
            descriptionMark.value = ''
            photoMark.value = ''
            isAddingMode = false
            btnAddMark.textContent = "Добавить метку"
            dialogAddMark.close()
        }
    })

    async function showAllMark() {
        try {
            myMap.geoObjects.removeAll();
    
            let response = await fetch('http://127.0.0.1:8000/metki', {
                headers: {'Content-Type': 'application/json'}
            });
    
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
    
            const marks = await response.json();
            console.log('Полученные метки:', marks);
    
            // Проверяем, что marks - массив
            if (!Array.isArray(marks)) {
                throw new Error('Ожидался массив меток');
            }
     
            marks.forEach(mark => {
    
                const placemark = new ymaps.Placemark(
                    [mark.x_coor, mark.y_coor],
                    {
                        hintContent: mark.title || 'Без названия'
                    },
                    {
                        preset: "islands#blackDotIcon"
                    }
                )

                placemark.events.add('click', function() {
                    window.location.href = `/metka/${mark.id}`;
                })
    
                myMap.geoObjects.add(placemark);
            })
    
        } catch (error) {
            console.error('Ошибка при загрузке меток:', error);
            alert('Ошибка при загрузке меток: ' + error.message);
        }
    }

    showMark.addEventListener('click', async () => {
        showAllMark()
    })
    async function addMark(title, coords, description){
    
        let formData = new FormData();
        
        for (let file of photoMark.files) {
            formData.append('photos', file)
        }

        let response = await fetch(`http://127.0.0.1:8000/metka/?title=${title}&x_coor=${coords[0]}&y_coor=${coords[1]}&description=${description}`, {
            method: 'POST',
            body: formData
        })

        response = await response.json()
        console.log('response: ', response)

        showAllMark(myMap)     
}
})


//FETCH-запрос для создания метки 

