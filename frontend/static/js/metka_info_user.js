let myMap
let x_coor_orig = document.querySelector('#info_x_coor').innerHTML
let y_coor_orig = document.querySelector('#info_y_coor').innerHTML
let title = document.querySelector('#metka_info_title').innerHTML

ymaps.ready(function () {
    
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10
    })

    myMap.geoObjects.removeAll();

    const placemark_orig = new ymaps.Placemark(
        [x_coor_orig, y_coor_orig],
        {
            hintContent: title
        },
        {
            preset: "islands#blackDotIcon"
        }
    )  

    myMap.geoObjects.add(placemark_orig)
    
})