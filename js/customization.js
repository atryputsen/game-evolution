var Customization = function(){
    var content = document.getElementById('customization');

    function init(){
        initCanvas();
        initItems();

        content.querySelector('button').addEventListener('click', applyChanges);
    }
    function initCanvas(){

    }
    function initItems(){
        var constructorList = constructorInfoGlobal,
            itemConstructor,
            parentElement,
            type,
            testElement,
            image;

        for (var i=0; i < constructorList.types.length; i++){
            type = constructorList.types[i];
            parentElement = document.getElementById(type);

            for (var j=0; j < constructorList[type].length; j++){
                itemConstructor = constructorList[type][j];
                testElement = document.createElement("li");
                testElement.dataset.type = type;
                testElement.dataset.id = j;

                if (fishInfoGlobal.hero[type] === j){
                    testElement.classList.add('selected');
                }

                if (itemConstructor.src) {
                    image = new Image();
                    image.src = itemConstructor.src;
                    testElement.appendChild(image);
                } else {
                    image = new Image();
                    image.src = itemConstructor.src_left;
                    testElement.appendChild(image);

                    image = new Image();
                    image.src = itemConstructor.src_right;
                    testElement.appendChild(image);
                }

                parentElement.appendChild(testElement);

                testElement.addEventListener('click', selectItem);
            }
        }
    }

    function selectItem(){
        var item = this,
            type = item.dataset.type,
            id = item.dataset.id;

        if (type && id) {
            item.parentElement.querySelector('.selected').classList.remove('selected');
            item.classList.add('selected');
            fishInfoGlobal.hero[type] = id;
        }
    }

    /* Remove all events */
    function applyChanges(){
        var items = content.querySelectorAll('ul ul li');

        this.removeEventListener('click', applyChanges);
        for (var i=0; i < items.length; i++){
            items[i].removeEventListener('click', selectItem);
        }

        var event = document.createEvent('Events');
        event.initEvent('customization.done');
        document.dispatchEvent(event);

        content.classList.add('hidden');
    }

    init();
};
