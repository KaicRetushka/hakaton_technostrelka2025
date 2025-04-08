let showMark = document.querySelector('#show_mark_btn')
let btnAddMark = document.querySelector('#add_mark_btn')
let dialogAddMark = document.querySelector('#add_mark_dialog')
let btnAddMarkCancel = document.querySelector('#add_mark_cancel')
let btnAddMarkSave = document.querySelector('#add_mark_save')
let nameMark = document.querySelector('#name_mark_input')
let descriptionMark = document.querySelector('#description_mark_input')
const photoMark = document.querySelector('#photo_mark_input')

function exitToTheGlav(event){
    const status = event.detail.xhr.status

    if (status === 200){
        location.reload()
    } else {
        alert('Произошла ошибка при выходе из аккаунта')
    }
}




ymaps.ready(function () {
    // Создаём карту
    const myMap = new ymaps.Map("map", {
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

    showMark.addEventListener('click', async () => {
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
                );

                placemark.events.add('click', function() {
                    window.location.href = `/metka/${mark.id}`;
                });
    
                myMap.geoObjects.add(placemark);
            });
    
        } catch (error) {
            console.error('Ошибка при загрузке меток:', error);
            alert('Ошибка при загрузке меток: ' + error.message);
        }
    });
})

//FETCH-запрос для вывода меток





//FETCH-запрос для создания метки 

async function addMark(title, coords, description) {
    try {

        let formData = new FormData();
        
        for (let file of photoMark.files) {
            formData.append('photos', file); // Лучше использовать 'photos[]' для массива
        }

        let response = await fetch(`http://127.0.0.1:8000/metka/?title=${title}&x_coor=${coords[0]}&y_coor=${coords[1]}&description=${description}`, {
            method: 'POST',
            body: formData
        })

        response = await response.json()
        console.log('response: ', response)

    } catch {

    }          
}