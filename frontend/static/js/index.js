let btnAddMark = document.querySelector('#add_mark_btn')
let dialogAddMark


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
        btnAddMark.textContent = isAddingMode ? "Отменить" : "Добавить метку";
    });

    // Обработчик клика по карте
    myMap.events.add('click', function (e) {
        if (!isAddingMode) return; // Если режим добавления выключен, ничего не делаем

        const coords = e.get('coords'); // Получаем координаты клика
        
        // Создаём метку
        const placemark = new ymaps.Placemark(
            coords,
            {
                hintContent: "Новая метка",
                balloonContent: `Координаты: ${coords}`
            },
            {
                preset: "islands#blackDotIcon"
            }
        );

        // Добавляем метку на карту
        myMap.geoObjects.add(placemark);
        console.log(`Добавлена метка в координатах: ${coords}`);

        isAddingMode = false; // Выключаем режим добавления
        btnAddMark.textContent = "Добавить метку";




    });
});
