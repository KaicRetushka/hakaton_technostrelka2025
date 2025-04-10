const showMarkCheckbox = document.querySelector('#show_mark_checkbox')
const showReviewCheckbox = document.querySelector('#show_review_checkbox')
let salonPlacemarks = []
let reviewPlacemarks = []
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
let addPokritieDialog = document.querySelector('#add_pokritie_dialog')
let closePokritieDialog = document.querySelector('#close_pokritie_dialog')
let sendPokritie = document.querySelector('#send_pokritie')
const exit_neiro = document.getElementById("exit-neiro")
let metkaPokritieReview = document.querySelector('#metkaPokritieReview')
let addReviewDialog = document.querySelector('#add_review_dialog')
let descriptionReview = document.querySelector('#description_review_input')
let btnAddReviewCancel = document.querySelector('#add_review_cancel')
let btnAddReviewSave = document.querySelector('#add_review_save')




exit_neiro.addEventListener("click", () => {
    document.getElementById("ws_dialog").close()
})



// Получаем элементы чекбоксов
const checkbox4G = document.getElementById('4_G_check');
const checkbox3G = document.getElementById('3_G_check');
const checkbox2G = document.getElementById('2_G_check');


checkbox4G.checked = false
checkbox3G.checked = false
checkbox2G.checked = false
showMarkCheckbox.checked = false
showReviewCheckbox.checked = false

// Создаём переменные, которые будут хранить текущее состояние
let is4GChecked = checkbox4G.checked;
let is3GChecked = checkbox3G.checked;
let is2GChecked = checkbox2G.checked;



// Добавляем обработчики событий для обновления переменных
checkbox4G.addEventListener('change', function() {
  is4GChecked = this.checked
  check4G(is4GChecked)
  console.log('4G:', is4GChecked)
});

checkbox3G.addEventListener('change', function() {
  is3GChecked = this.checked
  check3G(is3GChecked)
  console.log('3G:', is3GChecked)
});

checkbox2G.addEventListener('change', function() {
  is2GChecked = this.checked
  check2G(is2GChecked)
  console.log('2G:', is2GChecked)
});


btn_open_neiro.addEventListener('click', () => {
    chatConteiner = document.getElementById('chat-container');
    console.log(chatConteiner)
    chatConteiner.scrollTop = chatConteiner.scrollHeight;
    document.getElementById("ws_dialog").showModal()
})

closePokritieDialog.addEventListener('click', () => {
    addPokritieDialog.close()
    btnAddZone.textContent = "Добавить зону"
    isAddingZone = false
    myMap.geoObjects.removeAll()
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


ymaps.ready(async function () {
    // Создаём карту
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10
    });

    let isAddingMark = false;
    let isAddingZone = false;
    let isAddingReview = false;
    let currentPolygon = null;
    let polygonPoints = [];

    // Режим добавления зоны
    if (btnAddZone != undefined) {
        btnAddZone.addEventListener('click', () => {

            checkbox4G.checked = false
            checkbox3G.checked = false
            checkbox2G.checked = false
            showMarkCheckbox.checked = false
            showReviewCheckbox.checked = false

            myMap.geoObjects.removeAll()

            isAddingZone = !isAddingZone;
            isAddingMark = false; // Отключаем режим метки
            isAddingReview = false;
            btnAddZone.textContent = isAddingZone ? "Отменить" : "Добавить зону";
            btnAddMark.textContent = "Добавить метку";
            metkaPokritieReview.textContent = "Добавить отзыв"
            
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
                    strokeColor: '#1e98ff40',
                    
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
            isAddingReview = false;
            
            // Очищаем полигон если был
            if (currentPolygon) {
                myMap.geoObjects.remove(currentPolygon);
                currentPolygon = null;
            }
            polygonPoints = [];
            
            btnAddMark.textContent = isAddingMark ? "Отменить" : "Добавить метку";
            btnAddZone.textContent = "Добавить зону";
            nameMark.value = ''
            descriptionMark.value = ''
            gallery.innerHTML = ''
        });
    }


    // 1. Добавляем обработчик для кнопки "Добавить отзыв"
    if (metkaPokritieReview != undefined) {
        metkaPokritieReview.addEventListener('click', () => {
            isAddingReview = !isAddingReview;
            isAddingZone = false;
            isAddingMark = false;
            
            if (currentPolygon) {
                myMap.geoObjects.remove(currentPolygon);
                currentPolygon = null;
            }
            
            polygonPoints = [];
            
            // Изменяем текст кнопки в зависимости от состояния
            metkaPokritieReview.textContent = isAddingReview ? "Отменить" : "Добавить отзыв";
            btnAddZone.textContent = "Добавить зону";
            btnAddMark.textContent = "Добавить метку";
        });
    }








    



    

















    // Обработчик кликов по карте
    myMap.events.add('click', function(e) {
        const coords = e.get('coords');
        
        if (isAddingZone) {
            // Добавляем точку в полигон
            polygonPoints.push(coords);
            
            if (!currentPolygon) {
                currentPolygon = new ymaps.Polygon([], {}, {
                    fillColor: '#1e98ff40',
                    strokeColor: '#1e98ff40',
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
                        ////////////////////////
                        hintContent: nameMark.value
                    },
                    {
                        preset: "islands#blackDotIcon",
                        iconColor: '#000000' 
                    }
                );

                let title = nameMark.value;
                let description = descriptionMark.value;

                addMark(title, coords, description);

                console.log(`Добавлена метка: ${nameMark.value} (${coords})`);

                // Сбрасываем форму
                nameMark.value = '';
                descriptionMark.value = '';
                gallery.innerHTML = '';
                isAddingMark = false;
                btnAddMark.textContent = "Добавить метку";
                dialogAddMark.close();
            }
        }
        else if (isAddingReview) {
            addReviewDialog.showModal();
            
            btnAddReviewCancel.onclick = () => {
                isAddingReview = false;
                metkaPokritieReview.textContent = "Добавить отзыв";
                addReviewDialog.close();
                descriptionReview.value = ''
            };
            
            btnAddReviewSave.onclick = async () => {
                const description = descriptionReview.value;
                
                if (!description) {
                    alert('Введите текст отзыва');
                    return;
                }
    
                // Создаем метку с отзывом
                const placemark = new ymaps.Placemark(
                    coords,
                    {
                        hintContent: "Отзыв о покрытии",
                        balloonContent: description
                    },
                    {
                        preset: "islands#greenDotIcon",
                        balloonCloseButton: true,
                        hideIconOnBalloonOpen: false
                    }
                );
                
                addReview(coords, description)

                isAddingReview = false;
                metkaPokritieReview.textContent = "Добавить отзыв";
                descriptionReview.value = ''

                addReviewDialog.close();
            };
        }
    });




    // Завершение рисования полигона по двойному клику
    myMap.events.add('dblclick', function() {
        if (isAddingZone && polygonPoints.length >= 3) {
            isAddingZone = false;
            btnAddZone.textContent = "Добавить зону";
            console.log('Координаты полигона:', polygonPoints);
            addPokritieDialog.showModal()
        }
    });

    sendPokritie.addEventListener('click', () => {
        saveZone(polygonPoints);
        if (currentPolygon) {
            myMap.geoObjects.remove(currentPolygon);
        }
        addPokritieDialog.close()
        btnAddZone.textContent = "Добавить зону"
        isAddingZone = false
    })

    async function saveZone(coords) {
        try {

            const type_connection = document.querySelector('input[name="connection"]:checked').value

            let response = await fetch('http://127.0.0.1:8000/pokritie', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    type: type_connection,
                    arr_coor: coords
                })
            });
            
            response = await response.json();
            console.log('Зона сохранена:', response);
        } catch (error) {
            console.error('Ошибка сохранения зоны:', error);
        }
    }


    showMarkCheckbox.addEventListener('change', async function() {
        if (this.checked) {
            await showAllMark();
        } else {
            hideAllSalons();
        }
        btnAddZone.textContent = "Добавить зону";
        isAddingZone = false;
        isAddingReview = false;
    });


    async function showAllMark() {
        try {
            // Сначала удаляем все существующие метки салонов
            hideAllSalons();
            
            const response = await fetch('http://127.0.0.1:8000/metki', {
                headers: {'Content-Type': 'application/json'}
            });
    
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    
            const marks = await response.json();
            console.log('Полученные метки:', marks);


            if (!Array.isArray(marks)) throw new Error('Ожидался массив меток');
         
            // Создаем и сохраняем новые метки
            salonPlacemarks = marks.map(mark => {
                const placemark = new ymaps.Placemark(
                    [mark.x_coor, mark.y_coor],
                    {
                        hintContent: '<div style="text-transform: none;">Салон связи</div>'
                    },
                    {
                        preset: "islands#blackDotIcon", // Специальная иконка для салонов
                        iconColor: '#000000' // Красный цвет для отличия
                    }
                );
    
                placemark.events.add('click', () => {
                    window.location.href = `/metka/${mark.id}`;
                });
    
                myMap.geoObjects.add(placemark);
                return placemark;
            });
    
        } catch (error) {
            console.error('Ошибка при загрузке салонов:', error);
            alert('Ошибка загрузки салонов: ' + error.message);
            showMarkCheckbox.checked = false;
        }
    }


    function hideAllSalons() {
        salonPlacemarks.forEach(placemark => {
            myMap.geoObjects.remove(placemark);
        });
        salonPlacemarks = [];
        console.log('Вы спрятали салоны связи')
    }

    

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










    showReviewCheckbox.addEventListener('change', async function() {
        if (this.checked) {
            await showAllReview();
        } else {
            hideAllReview();
        }
        btnAddZone.textContent = "Добавить зону";
        isAddingZone = false;
        isAddingMark = false;
    });

    async function showAllReview() {
        try {
            // Сначала удаляем все существующие метки отзывов
            hideAllReview();
            
            const response = await fetch('/metki_poktitie', {
                headers: {'Content-Type': 'application/json'}
            });
    
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    
            const marks = await response.json();
            console.log('Полученные метки отзывов:', marks);


            if (!Array.isArray(marks)) throw new Error('Ожидался массив меток');


            // Создаем и сохраняем новые метки
            reviewPlacemarks = marks.map(mark => {

                // Получаем данные автора (предполагая, что у вас есть эта информация)
                const authorName = mark.cretor; // Или из другого источника
                    
                const description_text = mark.text


                // Форматируем содержимое балуна
                const balloonContent = `
                    <div style="padding: 10px; text-transform: none;">
                        <div style="font-style: italic; font-size: 10px; margin-bottom: 5px;">Автор: ${authorName}</div>
                        <div style="text-transform: none;">${description_text}</div>
                    </div>
                `;

                const placemark = new ymaps.Placemark(
                    [mark.x_coor, mark.y_coor],
                    {
                        hintContent: '<div style="text-transform: none;">Отзыв</div>',
                        balloonContent: balloonContent
                    },
                    {
                        preset: "islands#greenDotIcon", 
                        iconColor: '#009900' 
                    }
                );
    
                myMap.geoObjects.add(placemark);
                return placemark;
            });
    
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
            alert('Ошибка загрузки отзывов: ' + error.message);
            showReviewCheckbox.checked = false;
        }
    }


    function hideAllReview() {
        reviewPlacemarks.forEach(placemark => {
            myMap.geoObjects.remove(placemark);
        });
        reviewPlacemarks = [];
        console.log('Вы спрятали салоны связи')
    }




    async function addReview(coords, description) {
        try {
            let response = await fetch('/metka_pokritie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: description,
                    x_coor: coords[0],
                    y_coor: coords[1]
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            response = await response.json()
            console.log('Добавление отзыва: ', response)

        } catch (error) {
            console.error('Ошибка при добавлении отзыва:', error);
            throw error;
        }
    }


})






async function check4G(is4GChecked) {
    if (!myMap) {
        console.error("Карта не инициализирована");
        return;
    }

    if (is4GChecked) {
        try {
            const response = await fetch('/all_pokritia/4G', {
                headers: {'Content-Type': 'application/json'}
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Данные о покрытии 4G:', data);

            // Сначала удаляем ВСЕ существующие полигоны 4G
            const objectsToRemove = [];
            myMap.geoObjects.each(geoObject => {
                if (geoObject instanceof ymaps.Polygon && 
                    geoObject.options.get('zoneType') === '4G') {
                    objectsToRemove.push(geoObject);
                }
            });
            
            objectsToRemove.forEach(obj => myMap.geoObjects.remove(obj));

            // Добавляем новые полигоны
            data.forEach(item => {
                if (!item.arr_coor || !Array.isArray(item.arr_coor)) {
                    console.error('Некорректные данные координат:', item);
                    return;
                }

                let polygon = new ymaps.Polygon(
                    [item.arr_coor]
                , { hintContent: "Зона покрытия 4G" }, {
                    fillColor: '#F3B38680',
                    interactivityModel: 'default#transparent',
                    strokeWidth: 0,
                    opacity: 1.0,
                    zoneType: '4G',  // Обязательно добавляем идентификатор
                    zoneId: item.id,
                });
                const zoneId = polygon.options.get('zoneId');
                polygon.events.add("dblclick", async (e) => {
                    e.preventDefault();
                    console.log("click poligon")
                    if (confirm("Уудалить покрытие")){
                        myMap.geoObjects.remove(polygon);
                        response = await fetch(`/pokritie/${zoneId}`, {method: "DELETE"})
                    }
                    
                })

                myMap.geoObjects.add(polygon);
            });

        } catch (error) {
            console.error('Ошибка при загрузке зон 4G:', error);
            alert('Ошибка загрузки зон 4G: ' + error.message);
        }
    } else {
        // Удаляем ВСЕ полигоны 4G (более надежный способ)
        const objectsToRemove = [];
        myMap.geoObjects.each(geoObject => {
            if (geoObject instanceof ymaps.Polygon && 
                geoObject.options.get('zoneType') === '4G') {
                objectsToRemove.push(geoObject);
            }
        });
        
        objectsToRemove.forEach(obj => {
            myMap.geoObjects.remove(obj);
            console.log('Удален полигон 4G:', obj.options.get('zoneId'));
        });
    }
}











async function check3G(is3GChecked) {
    if (!myMap) {
        console.error("Карта не инициализирована");
        return;
    }

    if (is3GChecked) {
        try {
            const response = await fetch('/all_pokritia/3G', {
                headers: {'Content-Type': 'application/json'}
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Данные о покрытии 3G:', data);

            // Сначала удаляем ВСЕ существующие полигоны 3G
            const objectsToRemove = [];
            myMap.geoObjects.each(geoObject => {
                if (geoObject instanceof ymaps.Polygon && 
                    geoObject.options.get('zoneType') === '3G') {
                    objectsToRemove.push(geoObject);
                }
            });
            
            objectsToRemove.forEach(obj => myMap.geoObjects.remove(obj));

            // Добавляем новые полигоны
            data.forEach(item => {
                if (!item.arr_coor || !Array.isArray(item.arr_coor)) {
                    console.error('Некорректные данные координат:', item);
                    return;
                }

                let polygon = new ymaps.Polygon(
                    [item.arr_coor]
                , { hintContent: "Зона покрытия 3G" }, {
                    fillColor: '#EF87C980',
                    interactivityModel: 'default#transparent',
                    strokeWidth: 0,
                    opacity: 1.0,
                    zoneType: '3G',  // Обязательно добавляем идентификатор
                    zoneId: item.id,
                });
                const zoneId = polygon.options.get('zoneId');
                polygon.events.add("dblclick", async (e) => {
                    e.preventDefault();
                    console.log("click poligon")
                    if (confirm("Уудалить покрытие")){
                        myMap.geoObjects.remove(polygon);
                        response = await fetch(`/pokritie/${zoneId}`, {method: "DELETE"})
                    }
                    
                })
                myMap.geoObjects.add(polygon);
            });

        } catch (error) {
            console.error('Ошибка при загрузке зон 3G:', error);
            alert('Ошибка загрузки зон 3G: ' + error.message);
        }
    } else {
        // Удаляем ВСЕ полигоны 3G (более надежный способ)
        const objectsToRemove = [];
        myMap.geoObjects.each(geoObject => {
            if (geoObject instanceof ymaps.Polygon && 
                geoObject.options.get('zoneType') === '3G') {
                objectsToRemove.push(geoObject);
            }
        });
        
        objectsToRemove.forEach(obj => {
            myMap.geoObjects.remove(obj);
            console.log('Удален полигон 3G:', obj.options.get('zoneId'));
        });
    }
}









async function check2G(is2GChecked) {
    if (!myMap) {
        console.error("Карта не инициализирована");
        return;
    }

    if (is2GChecked) {
        try {
            const response = await fetch('/all_pokritia/2G', {
                headers: {'Content-Type': 'application/json'}
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Данные о покрытии 2G:', data);

            // Сначала удаляем ВСЕ существующие полигоны 2G
            const objectsToRemove = [];
            myMap.geoObjects.each(geoObject => {
                if (geoObject instanceof ymaps.Polygon && 
                    geoObject.options.get('zoneType') === '2G') {
                    objectsToRemove.push(geoObject);
                }
            });
            
            objectsToRemove.forEach(obj => myMap.geoObjects.remove(obj));

            // Добавляем новые полигоны
            data.forEach(item => {
                if (!item.arr_coor || !Array.isArray(item.arr_coor)) {
                    console.error('Некорректные данные координат:', item);
                    return;
                }

                let polygon = new ymaps.Polygon(
                    [item.arr_coor]
                , { hintContent: "Зона покрытия 2G" }, {
                    fillColor: '#986BA380',
                    interactivityModel: 'default#transparent',
                    strokeWidth: 0,
                    opacity: 1.0,
                    zoneType: '2G',  // Обязательно добавляем идентификатор
                    zoneId: item.id,
                });
                const zoneId = polygon.options.get('zoneId');
                polygon.events.add("dblclick", async (e) => {
                    e.preventDefault();
                    console.log("click poligon")
                    if (confirm("Уудалить покрытие")){
                        myMap.geoObjects.remove(polygon);
                        response = await fetch(`/pokritie/${zoneId}`, {method: "DELETE"})
                    }
                    
                })
                myMap.geoObjects.add(polygon);
            });

        } catch (error) {
            console.error('Ошибка при загрузке зон 2G:', error);
            alert('Ошибка загрузки зон 2G: ' + error.message);
        }
    } else {
        // Удаляем ВСЕ полигоны 2G (более надежный способ)
        const objectsToRemove = [];
        myMap.geoObjects.each(geoObject => {
            if (geoObject instanceof ymaps.Polygon && 
                geoObject.options.get('zoneType') === '2G') {
                objectsToRemove.push(geoObject);
            }
        });
        
        objectsToRemove.forEach(obj => {
            myMap.geoObjects.remove(obj);
            console.log('Удален полигон 2G:', obj.options.get('zoneId'));
        });
    }
}






//FETCH-запрос для создания метки 

