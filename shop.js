$(document).ready(function () {
    //QUICK ADD BUTTON
    $(".product-1, .product-2, .product-3, .product-4, .product-5, .product-6").hover(
        function () {
            $(this).find(".quick-add-button").show();
        },
        function () {
            $(this).find(".quick-add-button").hide();
        }
    );

    //DELIVERY DROPDOWN
    $(".delivery-flexbox").click(function () {
        $(".delivery-dropdown select").slideToggle("slow");
    });

    //SELECT DELIVERY OPTION AND UPDATE BASKET TOTAL
    $(".delivery-dropdown select").on("change", function () {
        let selectedDelivery = parseFloat($(this).val()); //parseFloat as parseInt was rounding the number up to the nearest whole number
        let basketTotalSpan = document.querySelector(".basket-sum");
        let oldBasketTotal = getBasketTotal();
        let deliveryUpdateBasket = oldBasketTotal + selectedDelivery; //calculates new total
        basketTotalSpan.innerHTML = deliveryUpdateBasket; //displays in HTML
    });

    //REMOVES PRODUCT FROM BASKET
    // using .on() allows the click handler to be added to the delete button that has been created in JS. I found this solution on stack overflow at
    //https://stackoverflow.com/questions/12065329/adding-event-listeners-to-dynamically-added-elements-using-jquery
    $(".basket").on("click", ".remove-item-button", function (e) {
        //I wasn't quite sure on the
        //.closest looks upwards to find the closest element with .basket-item-container class
        let row = $(this).closest(".basket-item-container");
        rowIndex = row.index(); //gets the index of the row that contains the button that was clicked
        basket.splice(rowIndex, 1); //splice removes item from basket array
        localStorage.setItem("basket", JSON.stringify(basket)); //updates local storage
        updateBasket();
    });

    //ALTERNATES BETWEEN TESTIMONIAL TEXTS AND COLOURS
    //I wasn't sure how to make this infinite but found a solution on stackoverflow for putting it in a function
    //https://stackoverflow.com/questions/4713477/how-to-make-a-jquery-infinite-animation
    function testimonialText() {
        $(".testimonial-text").fadeOut(4000, function () {
            $(".testimonial-text-2")
                .css("color", "#9a657c")
                .fadeIn(4000, function () {
                    $(".testimonial-text-2").fadeOut(4000, function () {
                        $(".testimonial-text").css("color", "#7b5163").fadeIn(4000);
                        testimonialText();
                    });
                });
        });
    }

    testimonialText();

    //ADDS PRODUCTS TO BASKET
    let basketButtons = document.querySelectorAll(".basket-button");
    let quickButtons = document.querySelectorAll(".quick-add-button");
    let basket = [];
    //GETS ITEMS FROM LOCAL STORAGE
    let retrieveBasket = localStorage.getItem("basket");
    if (retrieveBasket) {
        basket = JSON.parse(retrieveBasket);
    }

    function addToBasket() {
        //RETRIEVES ELEMENTS FROM HTML FILES
        let image = document.getElementById("image").getAttribute("src"); //I wasn't sure how to retrieve the product images but found this solution https://tutorial.eyehunts.com/js/javascript-get-image-source-from-img-tag-html-example-code/
        let title = document.getElementById("title").innerHTML;
        let quantity = document.getElementById("quantity").value;
        let price = document.getElementById("price").innerHTML;
        let product = {
            image: image,
            title: title,
            quantity: parseInt(quantity), // saves quantity as a number
            price: parseInt(price), // saves price as a number
        };

        //ADDS PRODUCT TO BASKET
        //I was unsure how to group the same items in the basket and couldn't find a solution online so asked my husband for advice. He suggested using findIndex
        //to check if the product is already in the basket and using the index to add the item
        let productInBasketIndex = basket.findIndex(function (basketItem) {
            return basketItem.title == title; //looks in the basket for the title being added
        });

        if (productInBasketIndex >= 0) {
            let oldQuantity = parseInt(basket[productInBasketIndex].quantity); //parses quantity in basket to number
            basket[productInBasketIndex].quantity = oldQuantity + parseInt(quantity); //adds quantity to old quantity
        } else {
            basket.push(product); //if product not already in basket the product is added
        }
        //ADDS ITEMS TO LOCAL STORAGE
        localStorage.setItem("basket", JSON.stringify(basket)); //converts array to string
    }

    //ADD TO BASKET ONCLICK EVENT LISTENER ON THE PRODUCT PAGE
    for (let i = 0; i < basketButtons.length; i++) {
        basketButtons[i].addEventListener("click", function (e) {
            //prevents refresh on click
            e.preventDefault();
            addToBasket();
            loadBasketCount();
            totalAlert();
        });
    }

    //QUICK ADD TO BASKET FROM SHOP PAGE
    function quickAddToBasket(button) {
        //RETRIEVES ELEMENTS FROM HTML FILES
        //I was pretty stuck with this. I used most of the code from the product page add to basket button but it didn't seem to work.
        //I had a look online but couldn't find anything on it so asked my husband who explained that I would have to call the buttons' parent element in order
        //to query for the elements containing the image, title etc.
        let image = button.parentElement.querySelector(".image").getAttribute("src");
        let title = button.parentElement.querySelector(".title").innerHTML;
        let quantity = 1;
        let price = button.parentElement.querySelector(".price").innerHTML;
        let product = {
            image: image,
            title: title,
            quantity: quantity,
            price: parseInt(price), // saves price as a number
        };

        //ADDS PRODUCT TO BASKET
        let productInBasketIndex = basket.findIndex(function (basketItem) {
            return basketItem.title == title; //looks in the basket for the title being added
        });

        //checks if product is in basket
        if (productInBasketIndex >= 0) {
            let oldQuantity = parseInt(basket[productInBasketIndex].quantity); //parses quantity in basket to number
            basket[productInBasketIndex].quantity = oldQuantity + parseInt(quantity); //adds quantity to old quantity
        } else {
            basket.push(product); //if product not already in basket the product is added
        }
        //ADDS ITEMS TO LOCAL STORAGE
        localStorage.setItem("basket", JSON.stringify(basket)); //converts array to string
    }

    //QUICK ADD TO BASKET ONCLICK EVENT LISTENER
    for (let i = 0; i < quickButtons.length; i++) {
        quickButtons[i].addEventListener("click", function (e) {
            //prevents refresh on click
            let button = quickButtons[i];
            e.preventDefault();
            quickAddToBasket(button);
            loadBasketCount();
            totalAlert();
        });
    }

    //ALERT
    function totalAlert() {
        alert("Total cost of basket is: £" + getBasketTotal());
    }

    //RETRIEVES STORED BASKET AMOUNT AND DISPLAYS ON LOAD - prevents the displayed basketCount from being lost when page is reloaded
    //again I struggled to find a solution online so asked my husband who said that I simply had to create a function that would check for
    //local storage data and display on load.
    function loadBasketCount() {
        let productCount = 0;

        basket.forEach(function (basketItem) {
            productCount += basketItem.quantity;
        });

        //checks if there are products in basket
        if (productCount) {
            document.querySelector(".basket-count").innerHTML = productCount;
        }
    }
    loadBasketCount();

    //PRODUCT DISPLAY IN BASKET
    let basketDiv = document.querySelector(".basket");

    function displayProduct(product) {
        let div = document.createElement("div");
        let productTotalPrice = product.price * product.quantity; //total price for each product
        div.setAttribute(
            "class",
            "basket-item-container d-flex align-items-center justify-content-around"
        ); //flex display
        div.innerHTML = `<div class="basket-item"><img src="${product.image}" width="60" /></div>
                        <div class="basket-item">${product.title}</div>
                        <div class="basket-item basket-item-quantity" contenteditable="true">${product.quantity}</div>
                        <div class="basket-item">£${productTotalPrice}</div> <input type="button" class="remove-item-button" value="x" />`;
        basketDiv.appendChild(div);

        //UPDATE BASKET BUTTON
        //I had a rough idea of how I wanted to do this. I knew that it would be easier using contenteditable="true" and adding an "update basket" button
        //than adding - & + buttons. However I really struggled with how to execute it. Again, I couldn't find a thing online so asked my husband who suggested
        //using a map function to loop through the products and create a new basket array
        let updateBasketButton = document.querySelector(".update-basket");
        updateBasketButton.addEventListener("click", function () {
            let basketItems = document.querySelectorAll(".basket-item-container");
            //I was unsure why my map function was erroring and my husband explained that it was because a the node list is returned by querySelectorAll so I would
            //have to change this to an array using array.from
            //row targets the product properties (title, quantity etc.)
            let newBasket = Array.from(basketItems).map(function (row, i) {
                let updatedProduct = basket[i];
                let basketItemQuantity = row.querySelector(".basket-item-quantity").innerHTML; //gets value of new quantity from innerHTML
                updatedProduct.quantity = parseInt(basketItemQuantity); //set product quantity to new quantity
                return updatedProduct; //returns updated product into array
            });

            basket = newBasket;
            localStorage.setItem("basket", JSON.stringify(basket)); //saves updated basket to local storage
            updateBasket();
            loadBasketCount();
        });
    }

    //UPDATES BASKET TOTAL
    function basketTotal() {
        let basketTotal = 0;
        let basketTotalSpan = document.querySelector(".basket-sum");
        for (let i = 0; i < basket.length; i++) {
            let product = basket[i];
            basketTotal += product.price * product.quantity;
        }
        basketTotalSpan.innerHTML = basketTotal;
    }

    // RETURNS BASKET TOTAL WITH PROMOCODE IF IT HAS BEEN APPLIED
    function getBasketTotal() {
        let basketTotal = 0;
        for (let i = 0; i < basket.length; i++) {
            let product = basket[i];
            basketTotal += product.price * product.quantity;
        }

        let couponApplied = localStorage.getItem("couponApplied");
        //checks if coupon has been applied, if so, it calculates new total
        if (couponApplied) {
            basketTotal = basketTotal * 0.9; //calculate new total
        }

        return basketTotal;
    }

    //DISCOUNT CODE
    //I used this solution on stackoverflow https://stackoverflow.com/questions/38865345/coupon-code-validation-funcanality-using-javascript-or-jquery as a rough
    //guide for how to implement the dicount codes. I chose to keep it simple with one code but if I had multiple codes I would use a map function to loop through
    //the codes
    function discountCode() {
        let testCoupon = "WELCOME10";
        let coupon = testCoupon;
        let promoButton = document.querySelector(".promo-submit-button");

        // only add event listener if the button is on the page
        if (promoButton) {
            promoButton.addEventListener("click", function (e) {
                e.preventDefault();
                let promoInput = document.querySelector(".promo-input").value;
                let couponApplied = localStorage.getItem("couponApplied");
                let promoAppliedText = document.querySelector(".promo-in-use");
                //checks if input matches promo code
                if (promoInput.toUpperCase() == coupon.toUpperCase()) {
                    //I was unsure of the syntax that was needed to prevent the code being applied twice so I asked my husband who suggested adding another if statement that looks
                    //to see if a coupon exists in local storage, and if so, will show a error message
                    if (couponApplied) {
                        alert("This coupon has already been applied!");
                        return; //prevents coupon being applied by stopping the rest of the code running
                    }
                    alert("Promo code applied!");
                    promoAppliedText.innerHTML = "Promo code has been applied";
                    localStorage.setItem("couponApplied", true); //stores to local storage
                    applyBasketTotalCoupon();
                } else {
                    alert("Invalid promo code!");
                }
            });
        }
    }

    discountCode();

    function applyBasketTotalCoupon() {
        let couponApplied = localStorage.getItem("couponApplied");
        //checks if coupon has been applied, if so, it
        if (couponApplied) {
            let basketTotalSpan = document.querySelector(".basket-sum");
            let promoAppliedText = document.querySelector(".promo-in-use");
            let oldBasketTotal = parseInt(basketTotalSpan.innerHTML); //retrieves basket total from .basket-sum innerHTML
            let promoUpdateBasket = oldBasketTotal * 0.9; //calculate new total
            basketTotalSpan.innerHTML = promoUpdateBasket; //update basket total in html
            promoAppliedText.innerHTML = "Promo code has been applied"; // show coupon applied text
        }
        //get value of basket total & parse
    }

    //loops through basket, renders each product & updates basket total
    function updateBasket() {
        basketDiv.innerHTML = ""; //prevents duplicate products in the basket when reloading
        for (let i = 0; i < basket.length; i++) {
            let product = basket[i];
            displayProduct(product);
        }
        basketTotal();
        applyBasketTotalCoupon();
    }

    //checks if you're on basket page
    if (basketDiv) {
        updateBasket();
    }

    //ORDER CONFIRMATION

    function generateUUID() {
        // Public Domain/MIT
        var d = new Date().getTime(); //Timestamp
        var d2 =
            (typeof performance !== "undefined" && performance.now && performance.now() * 1000) ||
            0; //Time in microseconds since page-load or 0 if unsupported
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) {
                //Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                //Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    function confirmOrder() {
        let orderConfirmation = document.querySelector(".order-confirmation");

        if (orderConfirmation) {
            //checks if there are products in basket
            if (basket.length > 0) {
                let UUID = generateUUID();
                let orderID = document.querySelector(".order-id");
                orderID.innerHTML = UUID;
                localStorage.clear();
            } else {
                document.location.href = "basket.html";
                alert("Your basket is empty!");
            }
        }
    }

    confirmOrder();
});
