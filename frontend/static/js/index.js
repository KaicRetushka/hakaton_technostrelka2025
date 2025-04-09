let showMark = document.querySelector('#show_mark_btn')
let btnAddMark = document.querySelector('#add_mark_btn')
let btnAddZone = document.querySelector('#add_zone_btn')
let dialogAddMark = document.querySelector('#add_mark_dialog')
let btnAddMarkCancel = document.querySelector('#add_mark_cancel')
let btnAddMarkSave = document.querySelector('#add_mark_save')
let nameMark = document.querySelector('#name_mark_input')
let descriptionMark = document.querySelector('#description_mark_input')
let myMap
const photoMark = document.querySelector('#photo_mark_input')
const gallery = document.querySelector('#gallery')
const btn_open_neiro = document.getElementById("btn-open-neiro")

btn_open_neiro.addEventListener("click", () => {
    document.getElementById("ws_dialog").showModal()
})


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
        center: [55.76, 37.64],
        zoom: 10
    });

    let isAddingMark = false;
    let isAddingZone = false;
    let currentPolygon = null;
    let polygonPoints = [];

    // Режим добавления зоны
    if (btnAddZone != undefined) {
        btnAddZone.addEventListener('click', () => {

            myMap.geoObjects.removeAll()

            isAddingZone = !isAddingZone;
            isAddingMark = false; // Отключаем режим метки
            btnAddZone.textContent = isAddingZone ? "Отменить" : "Добавить зону";
            btnAddMark.textContent = "Добавить метку";
            
            if (isAddingZone) {
                // Полный сброс предыдущего состояния
                polygonPoints = [];
                if (currentPolygon) {
                    myMap.geoObjects.remove(currentPolygon);
                    currentPolygon = null;
                }
                // Создаем новый полигон
                currentPolygon = new ymaps.Polygon([], {}, {
                    fillColor: '#1e98ff40',
                    strokeColor: '#1e98ff',
                    strokeWidth: 4,
                    hintContent: "Новая зона"
                });
                myMap.geoObjects.add(currentPolygon);
                alert('Кликайте на карте чтобы добавить вершины полигона. Двойной клик - завершить.');
            } else {
                // При отмене очищаем все
                if (currentPolygon) {
                    myMap.geoObjects.remove(currentPolygon);
                    currentPolygon = null;
                }
                polygonPoints = [];
            }
        });
    }

    // Режим добавления метки
    if (btnAddMark != undefined) {
        btnAddMark.addEventListener('click', () => {

            isAddingMark = !isAddingMark;
            isAddingZone = false; // Отключаем режим зоны
            
            // Очищаем полигон если был
            if (currentPolygon) {
                myMap.geoObjects.remove(currentPolygon);
                currentPolygon = null;
            }
            polygonPoints = [];
            
            btnAddMark.textContent = isAddingMark ? "Отменить" : "Добавить метку";
            btnAddZone.textContent = "Добавить зону";
        });
    }

    // Обработчик кликов по карте
    myMap.events.add('click', function (e) {
        const coords = e.get('coords');
        
        if (isAddingZone) {
            // Добавляем точку в полигон
            polygonPoints.push(coords);
            
            if (!currentPolygon) {
                currentPolygon = new ymaps.Polygon([], {}, {
                    fillColor: '#1e98ff40',
                    strokeColor: '#1e98ff',
                    strokeWidth: 4,
                    hintContent: "Новая зона"
                });
                myMap.geoObjects.add(currentPolygon);
            }
            
            currentPolygon.geometry.setCoordinates([polygonPoints]);
        }
        else if (isAddingMark) {
            dialogAddMark.showModal();

            btnAddMarkCancel.onclick = () => {
                dialogAddMark.close();
                isAddingMark = false;
                btnAddMark.textContent = "Добавить метку";
            };

            btnAddMarkSave.onclick = () => {
                const placemark = new ymaps.Placemark(
                    coords,
                    {
                        hintContent: nameMark.value
                    },
                    {
                        preset: "islands#blackDotIcon"
                    }
                );

                let title = nameMark.value;
                let description = descriptionMark.value;

                addMark(title, coords, description);

                myMap.geoObjects.add(placemark);
                console.log(`Добавлена метка: ${nameMark.value} (${coords})`);

                // Сбрасываем форму
                nameMark.value = '';
                descriptionMark.value = '';
                photoMark.value = '';
                isAddingMark = false;
                btnAddMark.textContent = "Добавить метку";
                dialogAddMark.close();
            }
        }
    });

    // Завершение рисования полигона по двойному клику
    myMap.events.add('dblclick', function() {
        if (isAddingZone && polygonPoints.length >= 3) {
            isAddingZone = false;
            btnAddZone.textContent = "Добавить зону";
            console.log('Координаты полигона:', polygonPoints);
            
            // Здесь можно добавить сохранение полигона на сервер
            saveZone(polygonPoints);
        }
    });

    async function saveZone(coords) {
        try {
            const response = await fetch('http://127.0.0.1:8000/zones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    coordinates: coords,
                    name: "Новая зона" // Можно добавить поле для имени
                })
            });
            
            const result = await response.json();
            console.log('Зона сохранена:', result);
        } catch (error) {
            console.error('Ошибка сохранения зоны:', error);
        }
    }





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
        btnAddZone.textContent = "Добавить зону"
        isAddingZone = false
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
    }


})


//FETCH-запрос для создания метки 

