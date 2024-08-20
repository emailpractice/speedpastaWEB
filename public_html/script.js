/*window.addEventListener('scroll', function () {
    const scrollPosition = window.scrollY;
    const image = document.querySelector('.parallax-image');
    const text = document.querySelector('.parallax-text');

    // 調整圖片和文字的相對垂直距離
    image.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    text.style.transform = `translate(0%, calc(-50% + ${scrollPosition * 0.1}px))`;
});
*/
/*下面是購物車跟選購的部份 */
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];
/*anchorbutton也在購物車區域是因為，按下購物車之後這兩個按鈕要消失 避免擋到購物車 */

let elem_anchorbutton = document.querySelector('#cta-btn');
let clickCount = 0;

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
    clickCount++;

})
closeCart.addEventListener('click', () => {
    clickCount++;

    body.classList.toggle('showCart');





})
/*左滑右滑操控購物車區域。 可以在手機板加上指引 讓使用者知道可以左滑右滑 */
document.addEventListener('DOMContentLoaded', function () {
    var startX;
    var startY;

    document.addEventListener('touchstart', function (e) {
        var touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });

    document.addEventListener('touchmove', function (e) {
        if (e.changedTouches.length > 0) {
            var touch = e.changedTouches[0];
            var deltaX = startX - touch.clientX;
            var deltaY = startY - touch.clientY;

            // 判斷手勢是否為左滑
            if (deltaX > 72 && Math.abs(deltaY) < 25) { // 這裡的數值可以根據需要調整
                // 觸發左滑事件
                console.log('左滑');
                // 執行相應操作，例如觸發按鈕點擊
                body.classList.add('showCart')
            }
            if (deltaX < -72 && Math.abs(deltaY) < 25) { // 這裡的數值可以根據需要調整
                // 觸發右滑事件
                console.log('右滑');
                // 執行相應操作，例如觸發按鈕點擊
                body.classList.remove('showCart')
            }
        }
    });
});

const addDataToHTML = () => {
    // remove datas default from HTML

    // add new datas
    if (products.length > 0) // if has data
    {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML =
                `<div class="imgAndOverlay" data_tag="${product.tag}">
                    <img class="product_img" src="${product.image}" alt="">
                    <div class="overlay"></div>
                </div>
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart"> 選購</button>
                `;

            listProductHTML.appendChild(newProduct);
        });
    }
}
listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let id_product = positionClick.parentElement.dataset.id;
        addToCart(id_product);

        ///按下選購按鈕之後，複製一個產品的照片<div>加入html。然後在等等add_fly_animation函數執行時再給這個div加上新的class來做動畫。
        let target_parent = event.target.parentNode;

        // Creating separate Image
        let img = target_parent.querySelector('.product_img');
        let flying_img = img.cloneNode();
        flying_img.classList.add('flying-img');
        target_parent.style.zIndex = "22";

        target_parent.appendChild(flying_img);


        const cart_svg = document.querySelector('.icon-cart span')
        const cart_svg_pos = cart_svg.getBoundingClientRect();

        const flying_img_pos = img.getBoundingClientRect();



        let data = {
            left: cart_svg_pos.left - (cart_svg_pos.width / 2 + flying_img_pos.left + img.width / 2),
            top: cart_svg_pos.bottom - (flying_img_pos.bottom - img.height / 2 - 15)
        }



        flying_img.style.cssText = `
                                --left : ${data.left.toFixed(2)}px;
                                --top : ${data.top.toFixed(2)}px;
                                `;

        /*讓購物車圖案的背景顏色區塊暫時的變成長方形，迎接飛過來的產品照片 */
        const cart_container = document.querySelector('.cartbg')
        cart_container.classList.add('active');

        setTimeout(() => {
            target_parent.style.zIndex = "";
            target_parent.removeChild(flying_img);
            cart_container.classList.remove('active');
        }, 1000);
    }

})
const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (cart.length <= 0) {
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    } else if (positionThisProductInCart < 0) {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
}
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
}
const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity = totalQuantity + item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('cartItem');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
            <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">
                ${info.name}
                </div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
                <div class="totalPrice">$${info.price * item.quantity}</div>
            `;
        })
    }
    iconCartSpan.innerText = totalQuantity;
}

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus')) {
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
})
const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;

            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                } else {
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
}


const initApp = () => {
    // get data product
    fetch('products.json') //這個product.json好像就是所謂指定的url了 fetch會找伺服器要求同目錄下的這個檔案。 
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            // get data cart from memory   //但只要有下面這段，改product.json的時候就會報錯。 因為快取裡面的array有8個東西 但改完json就沒有8個
            if (localStorage.getItem('cart')) {
                cart = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }

        })

}
initApp();

// 按下結帳的時候把購物車內容丟到本地儲存，結帳頁面的時候就可以從本地儲存取得購物車資料來展示給使用者看
var link = document.getElementById("go_to_checkout");


link.addEventListener("click", function (e) {
    var Cart = document.querySelector('.listCart');

    // 檢查 .listCart 是否有子元素
    if (Cart.children.length === 0) {
        // 沒有子元素，阻止預設行為
        e.preventDefault();
        alert('購物車現在是空的，請先完成選購。');
    }
    else {
        const cartContent = document.querySelector('.listCart').innerHTML;
        localStorage.setItem('cartHTML', cartContent);
    }

})




