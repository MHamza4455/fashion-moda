/*
* Palo Alto Theme
*
* Use this file to add custom Javascript to Palo Alto.  Keeping your custom
* Javascript in this fill will make it easier to update Palo Alto. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*/

/*
* Text Columns with Images Section JS
* UK-78 - Text Columns with Images - Add Tabs
*/


(function() {
// Add custom code below this line
document.addEventListener('DOMContentLoaded', function() {
  // Function to handle tab click
  function tabClickHandler(event) {
    var clickedTab = event.currentTarget;
    var tabName = clickedTab.dataset.tab;
    toggleClass(tabName); 
  }

  // Get all elements with the class 'tabs__link'
  var tabItems = document.querySelectorAll('.tabs__link');

  // Add click event listener to each tab item
  tabItems.forEach(function(tabItem) {
      tabItem.addEventListener('click', tabClickHandler);
  });

  // Function to toggle class based on tab name
  function toggleClass(tabName) {
    var items = document.querySelectorAll('.tabs_text_image li');
    items.forEach(function(item) {
      item.classList.remove('current');
    });
    
    // Add 'current' class to the clicked tab
    var clickedTab = document.querySelector('[data-tab="' + tabName + '"]');
    clickedTab.classList.add('current');
    
    document.querySelector('.tabsliders').style.opacity = "0"
    setTimeout(function() {
      var tab1 = document.querySelectorAll('[fortabdisplay="tab1"]');
      var tab2 = document.querySelectorAll('[fortabdisplay="tab2"]');
      var tab3 = document.querySelectorAll('[fortabdisplay="tab3"]');
      
      // Hide all tabs initially
      tab1.forEach(function(item) {
        item.style.display = 'none';
      });
      tab2.forEach(function(item) {
        item.style.display = 'none';
      });
      tab3.forEach(function(item) {
        item.style.display = 'none';
      });
      
      // Show the appropriate tab based on the clicked tab
      if (tabName === 'tab1') {
        tab1.forEach(function(item) {
          item.style.display = 'block';
        });
      } else if (tabName === 'tab2') {
        tab2.forEach(function(item) {
          item.style.display = 'block';
        });
      } else if (tabName === 'tab3') {
        tab3.forEach(function(item) {
          item.style.display = 'block';
        });
      }
      
      window.dispatchEvent(new Event('resize'));
      document.querySelector('.tabsliders').style.opacity = "1"
    }, 100)
  }
});

setTimeout(function() {
    if (document.querySelector('.current.tab1') != undefined) {
        var tab1 = document.querySelectorAll('[fortabdisplay="tab1"]');
        for (var i = 0; i < tab1.length; i++) {
            tab1[i].style.display = 'block';
        }
        var tab2 = document.querySelectorAll('[fortabdisplay="tab2"]');
        for (var i = 0; i < tab2.length; i++) {
            tab2[i].style.display = 'none';
        }
        var tab3 = document.querySelectorAll('[fortabdisplay="tab3"]');
        for (var i = 0; i < tab3.length; i++) {
            tab3[i].style.display = 'none';
        }
    }

    if (document.querySelector('.current.tab2') != undefined) {
        var tab1 = document.querySelectorAll('[fortabdisplay="tab1"]');
        for (var i = 0; i < tab1.length; i++) {
            tab1[i].style.display = 'none';
        }
        var tab2 = document.querySelectorAll('[fortabdisplay="tab2"]');
        for (var i = 0; i < tab2.length; i++) {
            tab2[i].style.display = 'block';
        }
        var tab3 = document.querySelectorAll('[fortabdisplay="tab3"]');
        for (var i = 0; i < tab3.length; i++) {
            tab3[i].style.display = 'none';
        }
    }

    if (document.querySelector('.current.tab3') != undefined) {
        var tab1 = document.querySelectorAll('[fortabdisplay="tab1"]');
        for (var i = 0; i < tab1.length; i++) {
            tab1[i].style.display = 'none';
        }
        var tab2 = document.querySelectorAll('[fortabdisplay="tab2"]');
        for (var i = 0; i < tab2.length; i++) {
            tab2[i].style.display = 'none';
        }
        var tab3 = document.querySelectorAll('[fortabdisplay="tab3"]');
        for (var i = 0; i < tab3.length; i++) {
            tab3[i].style.display = 'block';
        }
    }
    window.dispatchEvent(new Event('resize'));
}, 400)


  /*
  * PDP - FAQ Section
  * UK-109 - PDP - FAQ Section
  */
  document.addEventListener('DOMContentLoaded', function() {
      var accordionSections = document.querySelectorAll('.accordion__columns');

      accordionSections.forEach(function(section) {
          var li_lists = section.querySelectorAll('li.accordion__item');
          var li_lngth = li_lists.length;
          var li_count_target = Math.round(li_lngth / 2);

          section.querySelectorAll('li.accordion__item').forEach(function(el) {
              el.parentNode.removeChild(el);
          });

          li_lists.forEach(function(item, index) {
              if (index < li_count_target) {
                  section.querySelector('.accordion__column:first-child .accordion__list').appendChild(item);
              } else {
                  section.querySelector('.accordion__column:last-child .accordion__list').appendChild(item);
              }
          });
      });
  });

/*
* REMOVING THE BELOW CAUSES VIDEOS TO NOT LOAD?
*/
})();
/*
* REMOVING THE ABOVE CAUSES VIDEOS TO NOT LOAD?
*/


/*
* Country selector and popup modal JS
* UK-14 - International Site Detection / Redirection
*/

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

(function(){
    var modal_location = document.querySelector(".modal-location");
    var trigger = document.querySelector(".trigger");
    var closeButton = document.querySelector(".close-button");
    var continueButton = document.querySelector(".model-location-buttons button");

    function toggleModal() {
        modal_location.classList.toggle("show-modal-location");
    }

    function windowOnClick(event) {
        if (event.target === modal_location) {
            toggleModal();
        }
    }

    closeButton.addEventListener("click", toggleModal);
    continueButton.addEventListener("click", function(event){
        event.preventDefault();
        setCookie("country_selector_show", 'no', 30)
        document.querySelector('.modal-location').classList.remove("show-modal-location");
    return false;
    });

    async function getCurrentCountry() {
    try {
        // Make a request to ipinfo.io to get IP-based location information
        const domain = window.location.origin;
        const response = await fetch('/browsing_context_suggestions.json');
        const data = await response.json();

        // Extract country from response
        var country_code = data.detected_values.country.handle;
        if(country_code == "GB" && domain.indexOf('.co.uk') > -1 ){
          setTimeout(function(){
          document.querySelector('.modal-location').classList.remove("show-modal-location");
        },400)
        } else if(country_code == "US" && domain.indexOf('.com') > -1 ){
        setTimeout(function(){
          document.querySelector('.modal-location').classList.remove("show-modal-location");
        },400)
        }else {
        setTimeout(function(){
        if (getCookie('country_selector_show') == "yes" || getCookie('country_selector_show') == "") {
          document.querySelector('.modal-location').classList.add("show-modal-location");
        }
        },400)
        }
    }catch (error) {
        console.error('Error:', error);
    }
    }

    // Call the function to get current country
    getCurrentCountry();

})();


/*
* Cart, Mini-Cart & GWP JS
* UK-37
*/

let cart_total_items = 0;
let cart_drawer_scrollable_body = false;

/* Cart Change Events */
document.addEventListener('theme:cart:added', ()=>{
    /* Cart Header Counter */
    document.querySelectorAll('.mobile-menu__button.cart__toggle .cart-drawer__item-qty, .navlink.cart__toggle .cart-drawer__item-qty').forEach(item=>{
      var cartIcon = document.querySelector("[carticon]")
        item.textContent = cart.cartCount;
        cart.cartCount > 0 ? item.classList.remove('hidden-element') : item.classList.add('hidden-element')
        cart.cartCount < 1 ? cartIcon.classList.remove('active_cart_icon') : cartIcon.classList.add('active_cart_icon')
    });

  
    /* Cart empty state check - for cartdrawer and cart page */
    if(actuall_template_name != 'cart'){
        cart.cartCount > 0 ? document.querySelector('.cart-drawer__body').classList.remove('cart-is-empty') : document.querySelector('.cart-drawer__body').classList.add('cart-is-empty')
    }
    else{
        if(!cart.cartCount){
            document.querySelector('.upsell-cart-title').style.display = 'none';
        }
    }
  
    /* Upsell Recommendation Rebuild */
    if(cart_total_items != cart.totalItems){
        //Rebuild recommendation only if a user added/removed something (avoid rebuild if a user changed the quantity of something)
        get_upsell_recommendation();
    }


    /*
        Scroll Cart Drawer to the top after adding something
        Run only if a user added something (cart total check)
    */
    if(actuall_template_name != 'cart' && cart_total_items < cart.totalItems){
        if(!cart_drawer_prevent_scroll_back_after_add){
            cart_drawer_scrollable_body.scrollTo({
              top:0,
              behavior:'smooth'
            })
        }
        cart_drawer_prevent_scroll_back_after_add = false;
    }

    cart_total_items = cart.totalItems;

});


//this function responsible for update actual cart info each 3 seconds (currently we use it for GWP checks and Quantity Limitation check)
setInterval(sync_cart_data, 3000);
function sync_cart_data(){
  fetch("/cart.js").then(response => response.json())
  .then(data => {    
    document.dispatchEvent(new CustomEvent('cart-synced', {
      detail: {
        data: data
      }
    }))
  })
}
sync_cart_data();


/*
  Additional scripts that run after Cart Drawer Block initialization (HTML structure is ready at this moment)
*/

document.addEventListener('theme:cart:loaded',()=>{

  // Cart Total Items - need to prevent unnesessary scroll up in the CartDrawer after some changes in the cart
  cart_total_items = cart.totalItems;


  /* Cart Drawer Additional Scroll Related stuff */

  //Scroll Button Checker
  function cart_drawer_check_scroll_button_state(){
    if(cart_drawer_scrollable_body.clientHeight + cart_drawer_scrollable_body.scrollTop + 1 < cart_drawer_scrollable_body.scrollHeight){
      cart_drawer_scrollable_body.classList.add('scroller-button-active');
    }
    else{
      cart_drawer_scrollable_body.classList.remove('scroller-button-active');
    }
  }

  /*
    Add "Scroll Next" button to Cart Drawer scrollable content
    All pages except cart
  */

  cart_drawer_scrollable_body = document.querySelector('.cart-drawer__body');
  
  cart_drawer_scrollable_body.addEventListener('scroll', cart_drawer_check_scroll_button_state);
  document.addEventListener('cart-drawer-size-change', cart_drawer_check_scroll_button_state);

  cart_drawer_check_scroll_button_state();


  //Scroll Button Click Event
  cart_drawer_scrollable_body.querySelector('.cart-body-scroller').addEventListener('click',()=>{
    cart_drawer_scrollable_body.scrollTo({
      top: cart_drawer_scrollable_body.scrollHeight,
      behavior: 'smooth'
    });
  });

  //We need to scroll down cart drawer. Otherwise the coupon block will be hidden
  document.addEventListener('gwp-coupon-block-open',()=>{
    cart_drawer_scrollable_body.scrollTo({
      top:cart_drawer_scrollable_body.scrollHeight,
      behavior:'smooth'
    })
  });

  /* End Cart Drawr Additional Scroll Related stuff */


  //Close Cart Drawer when a user clicks "Continue Shopping" 
  document.querySelector('.cart-drawer .cart__foot-inner .close-cart-drawer')?.addEventListener('click',e=>{
    e.preventDefault();
    cart.closeCartDrawer();
  })
});


//Upsell Recommendation in the CartDrawer
function add_upsell_recommendation(upsell_cart_drawer_recommendation){
  document.querySelectorAll('.upsell-recommendation').forEach($upsell_block => {
  $upsell_block.innerHTML = "";
  
  // Add static "Buy It With" heading for LP US header outside the carousel
  if(isLpUsHeader && upsell_cart_drawer_recommendation.length > 0) {
    let $static_heading = document.createElement('div');
    $static_heading.classList.add('product-upsell__subtitle', 'static-upsell-heading');
    $static_heading.innerHTML = `<span class="buy-it-with-label">${theme.strings.upsell_buy_it_with_label} </span>`;
    $upsell_block.appendChild($static_heading);
  }
  
  let $element_wrapper = document.createElement('div');
  $element_wrapper.classList.add('upsell-wrapper');

  let need_quick_view = false;

  upsell_cart_drawer_recommendation.forEach(item=>{

    let add_to_cart_button;
    let price_range_text = "";

    if(item.variants.length > 1){
      //Need Quick View
      add_to_cart_button = `<button class='product-upsell__btn ${isLpUsHeader ? 'btn btn--outline btn--small btn--black' : 'btn btn--secondary'}' data-handle="${item.handle}" data-button-quick-view href="#">${theme.strings.upsell_select_size_button}</button>`
      price_range_text = `<div style="font-size:${isLpUsHeader ? '14px' : '12px'}; margin-top:${isLpUsHeader ? '8px' : '11px'}${isLpUsHeader ? '; line-height:120%; letter-spacing:0.28px' : ''}" class='price_range_text'>${themeVendor.themeCurrency.formatMoney(item.price_min, theme.moneyFormat)} - ${themeVendor.themeCurrency.formatMoney(item.price_max, theme.moneyFormat)}</div>`
      need_quick_view = true;
    }
    else{
      // For single variant products, show price separately above the button
      add_to_cart_button = `
      <input type="hidden" name="id" value="${item.variants[0].id}">
      <button name="add" data-upsell-btn data-focus-element data-add-to-cart data-handle="${item.handle}" data-product-id="${item.variants[0].id}" class='product-upsell__btn ${isLpUsHeader ? 'btn btn--outline btn--small btn--black' : 'btn btn--secondary'}'>${theme.strings.add_to_cart}</button>`
      price_range_text = `<div style="font-size:${isLpUsHeader ? '14px' : '12px'}; margin-top:${isLpUsHeader ? '8px' : '11px'}${isLpUsHeader ? '; line-height:120%; letter-spacing:0.28px' : ''};" class='single_price_text'>${themeVendor.themeCurrency.formatMoney(item.price, theme.moneyFormat)}</div>`
    }

    item.title = item.title.replace('No Frizz', '<span class="strikethrough">frizz</span><span class="registeredSymbol">®</span>');

    let $element = `<div class='product-upsell__holder product-upsell__holder--cart'>
      <div class='product-upsell'>
        <form class='product-upsell__content'>
          ${!isLpUsHeader ? `<div class='product-upsell__subtitle'>
            <a target="_blank" href="${item.url}">${theme.strings.upsell_show_product_link}</a>
          </div>` : ''}
          <div class='product-upsell__title h3'>
            ${isLpUsHeader ? `<a href="${item.url}">${item.title}</a>` : item.title}
          </div>
          ${price_range_text}
          ${add_to_cart_button}
        </form>
        <div class='product-upsell__image'>
          <a class='product-upsell__image__link' href='${item.url}'>
            <img class='product-upsell__image__thumb lazyautosizes lazyloaded' src="${item.featured_image + '&width=300'}"/>
          </a>
        </div>
      </div>
    </div>`;

    $element_wrapper.innerHTML += $element;
  });

  $upsell_block.appendChild($element_wrapper);

  if(need_quick_view){
    quick_view_helper($upsell_block);

    /* Open the cart drawer in case the Quick View was just closed */
    $upsell_block.querySelectorAll('[data-button-quick-view]').forEach(item => {
      item.addEventListener('click',()=>{
        quick_view_was_open_from_cart = true;
      });
    });
  }
  /*
<button type="button" name="add"
              class="product-upsell__btn btn btn--secondary"
              data-add-to-cart
              data-focus-element
              data-upsell-btn
              data-handle="3-step-barrier-boosting-set"
              data-product-id="44224436338986">
  */


  new themeVendor.Flickity( $upsell_block.querySelector('.upsell-wrapper'), {
      wrapAround: actuall_template_name != 'cart',
      pageDots: true,
      adaptiveHeight: true,//actuall_template_name != 'cart',
      prevNextButtons: isLpUsHeader,
      groupCells: actuall_template_name == 'cart',
      arrowShape: {
        x0: 10,
        x1: 60,
        y1: 50,
        x2: 65,
        y2: 45,
        x3: 20
      }
  });

  if(isLpUsHeader) {
    $upsell_block.querySelector('.flickity-prev-next-button.previous').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
      <path d="M9.50059 0.5L1 9M1 9L9.50059 17.5M1 9H21" stroke="black" stroke-linecap="round"/>
    </svg>`;
    
    $upsell_block.querySelector('.flickity-prev-next-button.next').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
      <path d="M12.4994 0.5L21 9M21 9L12.4994 17.5M21 9H1" stroke="black" stroke-linecap="round"/>
    </svg>`;
  }

  /*
    Scroll up CartDrawer block in case we add something from the Upsell Block
    + Prevent additional scroll up that runs after cart-change
  */
  if(actuall_template_name != 'cart'){
    $upsell_block.querySelectorAll('button[data-add-to-cart]').forEach(item=>{
      item.addEventListener('click', ()=>{
        item.closest('.cart-drawer__body').scrollTo({top:0, behavior:'smooth'});
        cart_drawer_prevent_scroll_back_after_add = true;
      });
    });
  }

  document.dispatchEvent(new Event('cart-drawer-size-change'));
});
}


let quick_view_was_open_from_cart = false;
document.addEventListener("quick-view-close", e=>{
  if(quick_view_was_open_from_cart){
    cart.openCartDrawer();
    quick_view_was_open_from_cart = false;
  }
})


let cart_drawer_prevent_scroll_back_after_add = false;

document.addEventListener('DOMContentLoaded', function (){
  //Build all needed preparation (GWP & Upsell Recommendation) in the Cart Drawer, in case we are not on the cart page
  if(actuall_template_name != 'cart'){
    cart.renderCartDrawer(false);
  }
  //Creates recommendation

  get_upsell_recommendation();
})

function get_upsell_recommendation(cart_products_ids_raw){
  //Collect all products ids from the cart
  let recommendation_urls = [];
  let cart_ids = [];

  let upsell_cart_drawer_recommendation = [];

  if(!cart_products_ids_raw){
    cart.items.forEach(item=>{
      cart_ids.push(Number(item.dataset.productId));
    })
  }
  else{
    cart_ids = cart_products_ids_raw;
  }

  cart_ids.forEach(item=>{
    let url = window.Shopify.routes.root + "recommendations/products.json?product_id=" + item + '&intent=';
    recommendation_urls.push(url+'complementary', url+'related');
  });
  
  //Send ajax request to all product in the cart
  let fetchPromises = recommendation_urls.map(url => fetch(url).then(response => response.json()));
  Promise.all(fetchPromises)
    .then(responses => {

      let upsell_cart_drawer_recommendation_helper = {};
      let result = [];
      let result_limit = theme.settings.upsell_products_limitation;

      //process responses and save data for recommendations
      responses.forEach((response, index) => {

        let initial_weight_value = response.intent == "complementary" ? 10 : 1

        response.products.forEach(item=>{
          /* exclude products with 0 price and products that already in the cart */
          if(item.price == 0 || cart_ids.includes(item.id)){
            return false;
          }
          
          /* Cross Items Counter */
          upsell_cart_drawer_recommendation_helper[item.id] = upsell_cart_drawer_recommendation_helper[item.id] ? upsell_cart_drawer_recommendation_helper[item.id] + 1 : initial_weight_value;

          upsell_cart_drawer_recommendation.push(item);

        })
      });


      /* Doubles sorter */
      upsell_cart_drawer_recommendation.sort((a,b)=>{
        if(upsell_cart_drawer_recommendation_helper[a.id] > upsell_cart_drawer_recommendation_helper[b.id]){
          return -1;
        }
        return 1;
      });

      upsell_cart_drawer_recommendation_helper = [];
      upsell_cart_drawer_recommendation.forEach(item=>{
        if(result.length < result_limit && !upsell_cart_drawer_recommendation_helper.includes(item.id)){
          upsell_cart_drawer_recommendation_helper.push(item.id);
          result.push(item);
        }
      })

      //Create "recommendation product" block
      add_upsell_recommendation(result);
    })
}


/*
* UK-72 & UK-100
* These scripts change Desktop/Mobile video depends on the user device resolution ("Custom Content" section & "Video" section)
* Basically it works with videos rendered by "snippets/video"
*/

document.addEventListener('theme:video:ready', (e)=>{
    video_mobile_desktop_change(e.detail);
})

window.addEventListener('resize', e=>{
  document.querySelectorAll('.resize-device-change video').forEach(item=>{
    video_mobile_desktop_change(item);
  });
});

function video_mobile_desktop_change(video_element){
  let mobile_source = video_element.dataset.mobileSource;
  let desktop_source = video_element.dataset.desktopSource;
  let mobile_resolution = video_element.dataset.mobileResolution;
  let video_source_result;

  if (mobile_source && desktop_source) {
    video_source_result = window.innerWidth < mobile_resolution  ? mobile_source : desktop_source;
  } else {
    video_source_result = desktop_source ? desktop_source : mobile_source;
  }
  
  let source_el = video_element.querySelector('source');
  
  if(!source_el.src) {
    // If source address wasn't set up, then set it up
    source_el.src = video_source_result;
  } else {
    //If source address exited and was changed, then reload the video with new soucre 
    if(source_el.src != video_source_result) {
      source_el.src = video_source_result;
      video_element.load();
    }
  }
}


/*
* UK-34
* Here JS code for Hair Care Quiz Integration
* Basically it this code use for call Revieve model"
*/

const quizLinks = document.querySelectorAll('a[href="/haircare-quiz"]');

// Add click event listener to each selected anchor element
quizLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default behavior of the link
        // Call the Revieve.API.show() function here
        Revieve.API.show();
    });
});


/*
* UK-63
* Max Qty Limit Functionality
*/

if(theme.settings.max_product_amount_per_order){

    /* Work with Quantity Field and Quantity Button in the CartDrawer block and on the Cart Page */
    function quantity_limitation_check(value, field){
        if(value > theme.settings.max_product_amount_per_order){
            show_notification_max_quantity(field);
        }
    }

    ["theme:cart:added", "theme:cart:loaded","theme:cartpage:ready"].forEach(event_name=>{
        document.addEventListener(event_name, (e)=>{
            document.querySelectorAll('.cart__item .cart__item__quantity').forEach(item=>{
                let quantity = Number(item.querySelector('.cart__item__quantity-field').value);
                if(quantity >= theme.settings.max_product_amount_per_order){
                    let plus = item.querySelector('.cart__item__quantity-plus');
                    plus.style.pointerEvents = "auto"; 
                    plus.addEventListener('click',function(){
                        show_notification_max_quantity(this);
                    })
                }
            });
        });
    });

    /* Block "Add to Cart" button in the Product Card if the Quantity Limit is reached */
    document.querySelectorAll('.product-grid-item__quick-buy form button .btn__inner').forEach(item=>{
        item.addEventListener('click', function(e){

            let id = this.closest('form').querySelector('input[name=id]').value;

            if(cart_get_quantity_by_id(id) >= theme.settings.max_product_amount_per_order){
                e.preventDefault();
                e.stopPropagation();
                show_notification_max_quantity(item); 
            }
        });
    });

    /* Product Page Quantity Field Change After Cart Updates */
    document.addEventListener("theme:cart:added", (e)=>{
        let quantity_field = document.querySelector('input[data-quantity-variant-id]')

        if(!quantity_field){
            return false;
        }

        let variant_id =  quantity_field.dataset.quantityVariantId;

        let quantity = cart_get_quantity_by_id(variant_id);

        let leftover_quantity = theme.settings.max_product_amount_per_order  - quantity;
        quantity_field.dataset.quantityLimitation = leftover_quantity;
        quantity_field.dispatchEvent(new CustomEvent('change', {detail:{silent:true}}));
        
        /* Hide if limit reached */
        leftover_quantity <= 0 ? quantity_field.closest('.product__form').classList.add('purchase-limit-reached') : quantity_field.closest('.product__form').classList.remove('purchase-limit-reached')

    });

    /* Variant Change on the product page */
    document.querySelector('.product__form input[name=id]')?.addEventListener('change', function(e){
        let new_variant = e.target.value;
        let quantity_field = this.closest('form').querySelector('.quantity__input')

        let in_cart_quantity = cart_get_quantity_by_id(new_variant);

        quantity_field.dataset.quantityVariantId = new_variant;
        quantity_field.dataset.quantityLimitation = theme.settings.max_product_amount_per_order  - in_cart_quantity;

        /* Hide/show if limit reached/unreached */
        theme.settings.max_product_amount_per_order - in_cart_quantity <= 0 ? quantity_field.closest('.product__form').classList.add('purchase-limit-reached') : quantity_field.closest('.product__form').classList.remove('purchase-limit-reached')
        
        quantity_field.dispatchEvent(new CustomEvent('change', {detail:{silent:true}}));
    })

    /* Quantity Field Limitation */
    document.querySelectorAll('input[data-quantity-limitation]').forEach(item=>{
        item.addEventListener('change',(e)=>{
            quantity_field_limitation_check(item, e.detail?.silent);
        })
    })

    function quantity_field_limitation_check(item, silent){
        let quantity_limitation = Number(item.dataset.quantityLimitation);
        if(Number(item.value) > quantity_limitation){
            item.value = quantity_limitation <= 0 ? 1 : quantity_limitation
            /* Show Message */
            if(!silent){
                show_notification_max_quantity(item);
            }
        }
    }

    /* Show Quantity Limitation Notification */
    function show_notification_max_quantity($field){

      let notification = document.createElement("span");
      notification.textContent = "Sorry maximum quantity already added"
      notification.classList.add('input-field-notification');

      let $field_position = $field.getBoundingClientRect();  

      let x = $field_position.top + window.pageYOffset;
      let y = $field_position.left + window.pageXOffset + $field.clientWidth/2;

      notification.style.top = x+'px';
      notification.style.left = y+'px';

      document.body.appendChild(notification);

      setTimeout(function(){
        notification.remove();
      },3000);

    }

    /* Get added quantity of specific variant */
    function cart_get_quantity_by_id(id){
        let result = 0;
        cart.items.forEach(item=>{
            let cart_item_id = item.dataset.item.split(':')[0];
            if(id == cart_item_id){
                result = Number(item.querySelector('.cart__item__quantity-field').value);
            }
        });
        return result;
    }

    /* Check quantity limitation in Quick Buy Popup */
    document.addEventListener('theme:popup:open', ()=>{

        let product_form = document.querySelector('.popup-quick-view__item .product__form');
        let variant_field = product_form.querySelector('.popup-quick-view__item .product__form input[name=id]');

        variant_field.addEventListener('change',function(){
            let variant_id = this.value;
            let cart_quantity = cart_get_quantity_by_id(variant_id);
            cart_quantity >= theme.settings.max_product_amount_per_order ? product_form.classList.add('purchase-limit-reached') : product_form.classList.remove('purchase-limit-reached')
        })
        variant_field.dispatchEvent(new Event('change'));
    })
      
    /* Run Global Quantity checks each time the cart synced */
    document.addEventListener('cart-synced', (e)=>{
        document.querySelectorAll('.cart__item .cart__item__quantity-field').forEach(item=>{
            if(Number(item.value) > theme.settings.max_product_amount_per_order){
                item.value = theme.settings.max_product_amount_per_order;
                item.dispatchEvent(new Event('change'));
            }
        })
    })
}


/* UK-20 - Badges */

["DOMContentLoaded", "theme:filters:init", "collection-page-ready"].forEach(event_name=>{
  document.addEventListener(event_name, ()=>{
    //We use setTimeout to avoid theme.js file change 
    setTimeout(function(){
      badge_builder_helper();
    }, event_name == 'DOMContentLoaded' ? 0 : 5);
  });
})
if(typeof collection_page_ready != 'undefined'){
  badge_builder_helper();
}

function badge_builder_helper(){
  document.getElementById('badges_styles')?.remove();
  //Extract Data from JSON containers in Product Grid Elements
  let badges_images = {}
  document.querySelectorAll('script.badge-info').forEach(script_tag=>{
    let data = JSON.parse(script_tag.textContent);
    if(!badges_images[data.css_selector]){
      badges_images[data.css_selector] = [];
    }

    //Date Format
    if(data.start_date){
      data.start_date = new Date(data.start_date)
    }
    if(data.end_date){
      data.end_date = new Date(data.end_date)
    }
    badges_images[data.css_selector].push(data)
  })


  let current_time = new Date(((new Date()).toLocaleString('en-US', { timeZone: 'Europe/London' })));

  let css_text = "";
  for(badge_image_selector in badges_images){

    let badge_images = badges_images[badge_image_selector];
    let images = '';
    let position = '';
    let size = '';
    let show_something = false;
    let occupied_positions = {};


    badge_images.forEach(item=>{     
      if(occupied_positions[item.position] || item.start_date > current_time || item.end_date < current_time){
        return false;
      }

      occupied_positions[item.position] = true;
      
      images += "url('"+item.image+"'),";

      if(item.position == 'Top Right'){
        position += 'calc(100% - 1.5rem) 1.5rem,';
      }
      if(item.position == 'Bottom Left'){
        position += '1.5rem calc(100% - 1.5rem),';
      }

      size += item.size ? item.size+'px,' : '67px,'


      show_something = true;
    })


    if(show_something){
      css_text += ` ${badge_image_selector}::after{
        background-image: ${images.slice(0,-1)};
        background-position: ${position.slice(0,-1)};
        display: block !important;
        content: '' !important;
        background-size: ${size.slice(0,-1)};         
      } `;
    }
  }

  if(css_text){
    let style = document.createElement('style');
    style.type = 'text/css';
    style.id = "badges_styles"
    style.appendChild(document.createTextNode(css_text));
    document.head.appendChild(style);
  }
}




// REN-223 Collapse long Product Description
document.addEventListener("DOMContentLoaded", function() {
    console.log("Document ready");

    document.querySelectorAll('.product__block.product__description .description-content[collapse-characters]').forEach(function(descriptionContent) {
        console.log("Found description-content element");
        
        var collapseAfter = descriptionContent.getAttribute('collapse-characters');
        console.log("Collapse after characters:", collapseAfter);
        collapseAfter = parseInt(collapseAfter);

        var fullText = descriptionContent.innerHTML.trim();

        if (fullText.length > collapseAfter) {
            var collapsedText = fullText.substring(0, collapseAfter);
            var lastSpaceIndex = collapsedText.lastIndexOf(' ');
            if (lastSpaceIndex !== -1) {
                collapsedText = collapsedText.substring(0, lastSpaceIndex);
            }
            collapsedText = collapsedText.replace(/&nbsp;/g, '<br>');
            if (collapsedText.trim() === '') {
                descriptionContent.innerHTML = '';
            } else {
                descriptionContent.innerHTML = '<p>' + collapsedText + '...<br><a href="#" class="read-more">Read More ˅</a></p>';
            }
        }

        descriptionContent.addEventListener('click', function(e) {
            if (e.target.classList.contains('read-more')) {
                e.preventDefault();
                var readMoreLink = e.target;
                if (readMoreLink.classList.contains('expanded')) {
                    descriptionContent.innerHTML = '<p>' + collapsedText + '...<br><a href="#" class="read-more">Read More ˅</a></p>';
                    readMoreLink.classList.remove('expanded');
                    readMoreLink.textContent = 'Read More ˅';
                } else {
                    descriptionContent.innerHTML = '<p>' + fullText + '</p><p><a href="#" class="read-less">Read Less ˄</a></p>';
                    readMoreLink.classList.add('expanded');
                    readMoreLink.textContent = 'Read Less ˄';
                }
            }
            if (e.target.classList.contains('read-less')) {
                e.preventDefault();
                descriptionContent.innerHTML = '<p>' + collapsedText + '...<br><a href="#" class="read-more">Read More ˅</a></p>';
                var readMoreLinks = descriptionContent.querySelectorAll('.read-more');
                readMoreLinks.forEach(function(link) {
                    link.classList.remove('expanded');
                    link.textContent = 'Read More ˅';
                });
            }
        });
    });
});


//REN-94 - ReCharge UI 
document.addEventListener('DOMContentLoaded', (e)=>{


  let rechage_block = document.querySelector('.recharge-subscription-widget');
  let product_selectors_block = document.querySelector('.selector-wrapper');


  
  if(rechage_block){
    rechage_block.addEventListener('change', function(e){
      if(e.target.name == 'purchaseOption'){
        recharge_widget_change_callback(e.target.value, rechage_block);
      }
    });

    let helper = setInterval(function(){
      let value = rechage_block.querySelector('input:checked')?.value
      if(value){
        helper = clearInterval(helper);
        recharge_widget_change_callback(value, rechage_block);
      }
    },100)
  }






  function recharge_widget_change_callback(value, widget_block){
    let subscription_chosed = value == 'subscription'


    //Change price type in variant selectors block
    if(subscription_chosed){
      product_selectors_block.classList.add('purchase-type-subscription');
    }
    else{
      product_selectors_block.classList.remove('purchase-type-subscription');
    }


    widget_block.querySelector('.rc-subscription-details').style.display = subscription_chosed ? 'flex' : 'none';


    let block = widget_block.closest('.form__wrapper');
    if(!block){
      return false;
    }

    let variant_id = block.querySelector('input[name=id]').value;
    let data = JSON.parse(document.querySelector('[data-product-json]').innerHTML);

    let result = data.variants.some(item=>{
      if(item.id == variant_id){
        
        let price_block = block.querySelector('.product__price--regular');
        let compare_price = block.querySelector('.product__price--compare');

        if(subscription_chosed){
          let info = item.selling_plan_allocations[0];
          price_block.innerHTML = themeVendor.themeCurrency.formatMoney(info.price, theme.moneyFormat);
          compare_price.innerHTML = themeVendor.themeCurrency.formatMoney(info.compare_at_price, theme.moneyFormat);
          compare_price.classList.remove('hidden');
        }
        else{
          price_block.innerHTML = themeVendor.themeCurrency.formatMoney(item.price, theme.moneyFormat);
          compare_price.innerHTML = themeVendor.themeCurrency.formatMoney(0, theme.moneyFormat);
          compare_price.classList.add('hidden');
        }

        return true;
      }
    });    
  }


});

// UK-248 - Video Controls
document.addEventListener("DOMContentLoaded", function() {
  const defaultVolume = 0.4;

  const setupVideoFlowControls = (video, controlsContainer) => {
    const button = controlsContainer.querySelector('.video-flow-button');
    if (!button) return;
    
    const playIcon = button.querySelector('.video-play-icon');
    const pauseIcon = button.querySelector('.video-pause-icon');

    if (!playIcon || !pauseIcon) {
      return;
    }

    const switchButtonAppearance = () => {
      playIcon.style.display = video.paused ? '' : 'none';
      pauseIcon.style.display = video.paused ? 'none' : '';
    };

    // Shopify theme adds touchstart event listeners to mobile video wrappers to unpause the video if user taps on it.
    // And it interferes with our controls, so we need to stop this event from propagating to the video container if button is clicked.
    button.addEventListener("touchstart", event => event.stopPropagation());
    
    button.addEventListener('click', function() {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }

      switchButtonAppearance();
    });

    // Update buttons automatically when video is played
    video.addEventListener('play', switchButtonAppearance);

    // Update buttons automatically when video ends
    video.addEventListener('ended', switchButtonAppearance);

    // Set initial buttons state based on video state
    switchButtonAppearance();
  };

  const setupVideoAudioControls = (video, controlsContainer) => {
    const button = controlsContainer.querySelector('.video-sound-button');
    if (!button) return;
    
    const muteIcon = button.querySelector('.video-mute-icon');
    const unmuteIcon = button.querySelector('.video-unmute-icon');

    if (!muteIcon || !unmuteIcon) {
      return;
    }

    const switchButtonAppearance = () => {
      muteIcon.style.display = video.muted ? '' : 'none';
      unmuteIcon.style.display = video.muted ? 'none' : '';
    };

    // Shopify theme adds touchstart event listeners to mobile video wrappers to unpause the video if user taps on it.
    // And it interferes with our controls, so we need to stop this event from propagating to the video container if button is clicked.
    button.addEventListener("touchstart", event => event.stopPropagation());

    button.addEventListener('click', function() {
      video.muted = !video.muted;
      if (!video.muted) video.volume = defaultVolume;

      switchButtonAppearance();
    });

    video.addEventListener('volumechange', switchButtonAppearance);

    // Set initial buttons state based on video state
    switchButtonAppearance();
  };

  // Setup video controls for standard video component
  const setupVideoControls = (container) => {
    // Videos are lazy-loaded, so we need to observe the container for video element appearance
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const video = container.querySelector('video');
        if (!video) return;

        if (video.getAttribute('controls-loaded')) return;

        mutationObserver.disconnect();
        video.setAttribute('controls-loaded', 'true');
        
        setupVideoFlowControls(video, container);
        setupVideoAudioControls(video, container);

        // Unhide controls once ready
        container.querySelector('.video-controls').style.display = 'flex';
      });
    });

    mutationObserver.observe(container, { childList: true, subtree: true });
  };

  const setupPromoVideoFlowControls = (promoVideoContainer) => {
    const videoDesktop = promoVideoContainer.querySelector('.video-desktop');
    const videoMobile = promoVideoContainer.querySelector('.video-mobile');

    const controlsContainer = promoVideoContainer.parentElement.parentElement;

    const button = controlsContainer.querySelector('.video-flow-button');
    if (!button) return;

    const getActiveVideo = () => {
      if (getComputedStyle(videoDesktop).display === 'block') {
        return videoDesktop;
      }

      if (getComputedStyle(videoMobile).display === 'block') {
        return videoMobile;
      }

      throw new Error('No active video found');
    };
    
    const playIcon = button.querySelector('.video-play-icon');
    const pauseIcon = button.querySelector('.video-pause-icon');

    let isPaused = false;

    const switchButtonAppearance = () => {
      playIcon.style.display = isPaused ? '' : 'none';
      pauseIcon.style.display = isPaused ? 'none' : '';
    };

    // Shopify theme adds touchstart event listeners to mobile video wrappers to unpause the video if user taps on it.
    // And it interferes with our controls, so we need to stop this event from propagating to the video container if button is clicked.
    button.addEventListener("touchstart", event => event.stopPropagation());

    button.addEventListener('click', function() {
      const activeVideo = getActiveVideo();
      
      isPaused = !isPaused;
      if (isPaused) {
        activeVideo.pause();
      } else {
        activeVideo.play();
      }
      
      switchButtonAppearance();
    });

    switchButtonAppearance();
  };

  const setupPromoVideoAudioControls = (promoVideoContainer) => {
    const videoMobile = promoVideoContainer.querySelector('.video-mobile');
    const videoDesktop = promoVideoContainer.querySelector('.video-desktop');

    const controlsContainer = promoVideoContainer.parentElement.parentElement;

    let isMuted = true;
    
    const button = controlsContainer.querySelector('.video-sound-button');
    if (!button) return;

    const getActiveVideo = () => {
      if (getComputedStyle(videoDesktop).display === 'block') {
        return videoDesktop;
      }

      if (getComputedStyle(videoMobile).display === 'block') {
        return videoMobile;
      }

      throw new Error('No active video found');
    };
    
    const muteIcon = button.querySelector('.video-mute-icon');
    const unmuteIcon = button.querySelector('.video-unmute-icon');

    const switchButtonAppearance = () => {
      muteIcon.style.display = isMuted ? '' : 'none';
      unmuteIcon.style.display = isMuted ? 'none' : '';
    };

    // Shopify theme adds touchstart event listeners to mobile video wrappers to unpause the video if user taps on it.
    // And it interferes with our controls, so we need to stop this event from propagating to the video container if button is clicked.
    button.addEventListener("touchstart", event => event.stopPropagation());

    button.addEventListener('click', function() {
      const activeVideo = getActiveVideo();
      
      isMuted = !isMuted;
      activeVideo.muted = isMuted;

      if (!isMuted) {
        activeVideo.volume = defaultVolume;
      }
      
      switchButtonAppearance();
    });

    switchButtonAppearance();
  };

  // Setup video controls for promo video component
  const setupPromoVideoControls = (promoVideoContainer) => {
    setupPromoVideoFlowControls(promoVideoContainer);
    setupPromoVideoAudioControls(promoVideoContainer);

    // Unhide controls once ready
    const controlsContainer = promoVideoContainer.parentElement.parentElement;
    controlsContainer.querySelector('.video-controls').style.display = 'flex';
  };

  // If in design mode update video controls when sections are loaded
  if (Shopify.designMode) {
    // Sections are loaded if their properties change so we can update video controls in case relevant properties have changed
    document.addEventListener('shopify:section:load', function(event) {
      const section = event.target;
      
      const videoWrapper = section.querySelector('.video-wrapper');
      if (videoWrapper) {
        setupVideoControls(section);
        return;
      }
      
      const promoVideoContainers = document.querySelectorAll('.promo-video');
      promoVideoContainers.forEach(promoVideo => setupPromoVideoControls(promoVideo));
    });
  }

  // Standard video components
  const videoContainers = document.querySelectorAll('.video-wrapper');
  videoContainers.forEach(container => setupVideoControls(container));

  // Promo video component
  const promoVideoContainers = document.querySelectorAll('.promo-video');
  promoVideoContainers.forEach(promoVideo => setupPromoVideoControls(promoVideo));
});



/* UKSHOP-188 - Create Account Button Section */
  document.addEventListener('DOMContentLoaded', ()=>{

    let account_popup = document.querySelector('.create-account-popup')

    account_popup.classList.add('main-create-account-popup');

    account_popup.querySelector('.icon-close').addEventListener('click', ()=>{
      document.documentElement.classList.toggle('create-account-popup-active');
    })

    account_popup.addEventListener('click', e=>{
      if(e.target.classList.contains('create-account-popup')){
        document.documentElement.classList.toggle('create-account-popup-active');
      }
    })

    document.querySelectorAll('.create-account-popup-call').forEach(item=>{
      item.addEventListener('click', ()=>{
        document.documentElement.classList.toggle('create-account-popup-active');
      })
    })



      

  })
/* END UKSHOP-188 */



/*
  REN-295 Product Grid Images Slider
*/
document.addEventListener('DOMContentLoaded', ()=>{

  document.querySelectorAll('.product-grid-item.product-grid-item-image-slider .product-grid-item__image').forEach(element=>{
    let item = element.querySelector('.product__media__holder');
    let slide_width = item.clientWidth;
    let slides_amount = item.children.length;
    let current_position = 0;

    let max_shift = item.scrollWidth - slide_width;

    let slider_moving = false;
    let initial_shift = 0;
    let initial_x = 0;
    let initial_y = 0;

    window.addEventListener('resize',()=>{
      slide_width = item.clientWidth;
      max_shift = item.scrollWidth - slide_width;
      current_position = 0;
      slider_move();
    })

    let prevent_link_click = false;

    item.addEventListener('click', (e)=>{
      if(prevent_link_click){
        e.preventDefault();
      }
    });

    //slide starts when hover or what...
    if(theme.settings.productGridHover == 'slide_to_second'){
      item.addEventListener('mouseover',(e)=>{
        current_position = 1;
        slider_move();
      }, { once: true })
    }

    ['mousedown','touchstart'].forEach(event_name => {
      item.addEventListener(event_name, (e)=>{

        if(event_name == 'mousedown'){
          e.preventDefault();
        }

        slider_moving = true;
        initial_x = e.pageX ? e.pageX : e.touches[0].pageX;
        initial_y = e.pageY ? e.pageY : e.touches[0].screenY;

        initial_shift = current_position * slide_width;
        initial_shift = initial_shift > max_shift ? max_shift : initial_shift;
        item.classList.add('drag');
      });
    });


    ['mouseup', 'touchend', 'slider_vertical_swipe'].forEach(event_name => {
      document.addEventListener(event_name, (e)=>{

        if(slider_moving){
          slider_moving = false;
          item.classList.remove('drag');

          let page_x;
          let page_y;

          if(event_name == 'slider_vertical_swipe'){
            page_x = e.detail.x;
            page_y = e.detail.y;
          }
          else{
            page_x = e.pageX ? e.pageX : e.changedTouches[0].pageX;
            page_y = e.pageY ? e.pageY : e.changedTouches[0].screenY;
          }

          if(Math.abs(initial_x - page_x) > 40){
            if(initial_x > page_x){
              current_position = current_position == slides_amount -1 ? current_position : current_position + 1;

            }
            else{
              current_position = current_position == 0 ? 0 : current_position - 1;
            }
          }

          slider_move();

          if(Math.abs(initial_x - page_x) > 5 || Math.abs(initial_y - page_y) > 5){
            prevent_link_click = true;
            document.addEventListener('click',()=>{
              prevent_link_click = false;
            },{ once: true })
          }

        }
      });
    });

    ['mousemove','touchmove'].forEach(event_name=>{
      document.addEventListener(event_name, (e)=>{
        if(slider_moving){

          let page_x = e.pageX ? e.pageX : e.touches[0].pageX;
          let page_y = e.pageY ? e.pageY : e.touches[0].screenY;


          if(event_name == 'touchmove'){
            if(Math.abs(page_x - initial_x) * 1.25 > Math.abs(page_y - initial_y)){
              //Horizontal movement
              e.preventDefault();
            }
            else{
              //Vertical movement
              document.dispatchEvent(new CustomEvent('slider_vertical_swipe', {detail:{x:page_x, y:page_y}}));
              return false;
            }
          }

          let x_shift = page_x - initial_x;
          let new_shift = initial_shift - x_shift;
          new_shift = new_shift > 0 ? new_shift : 0;
          new_shift = new_shift > max_shift ? max_shift : new_shift;
          item.style.transform = `translateX(-${new_shift}px)`;
        }
      },{ passive: false })
    });

    function slider_move(){
      let shift = current_position*slide_width;
      shift = shift > max_shift ? max_shift : shift;
      item.style.transform = `translateX(-${(shift)}px)`;

      //Arrows changes
      [arrow_left, arrow_right].forEach(item=>{
        item?.classList.remove('disabled');
      });
      if(current_position === 0){
        arrow_left?.classList.add('disabled');
      }
      if(current_position == slides_amount -1){
        arrow_right?.classList.add('disabled');
      }

      //Dots changes
      element.querySelector('.product-grid-image-pagination .active')?.classList.remove('active');
      element.querySelector(`.product-grid-image-pagination li:nth-child(${current_position+1})`)?.classList.add('active');
    }

    /* Slider Arrows Work */
    let arrow_left = element.querySelector('.product-grid-image-swiper-arrow.left');
    let arrow_right = element.querySelector('.product-grid-image-swiper-arrow.right');

    [arrow_right, arrow_left].forEach(button=>{
      button?.addEventListener('click',()=>{
        if(button.classList.contains('disabled')){
          return false;
        }
        current_position+=button.classList.contains('left') ? -1 : 1;
        slider_move();
      })
    })

    /* Slider Dots Work */
    let dots = element.querySelector('.product-grid-image-pagination');

    if(dots){

      let quick_buy_block = element.querySelector('.product-grid-item__quick-buy');
      let quick_buy_button = quick_buy_block.querySelector('.btn--quick');

      if(quick_buy_button.getBoundingClientRect()?.width != 0){
        console.log(dots,  quick_buy_block.offsetWidth, quick_buy_button.offsetLeft);
        let max_width_minus = (quick_buy_block.offsetWidth - quick_buy_button.offsetLeft) + 5 ;
        dots.style.maxWidth = `calc(100% - ${max_width_minus}px)`;
      }

      dots.querySelectorAll('li').forEach(dot=>{
        dot.addEventListener('click', ()=>{
          current_position = Number(dot.dataset.id);
          slider_move();
        })
      })
    }

  });
});

document.addEventListener('DOMContentLoaded', ()=>{
  if(theme.settings.product_grid_image_slider_demo){
    let swipe_slider = document.querySelector('.product-grid-item.product-grid-item-image-slider .product__media__holder');
    let swipe_slider_first_image = swipe_slider.querySelector('img');

    if(swipe_slider_first_image.complete){
      swipe_slider.classList.add('swipe-animation-demo');
    } 
    else{
      swipe_slider_first_image.addEventListener('load',()=>{
        swipe_slider.classList.add('swipe-animation-demo');
      });    
    }

    //Delete Animation Class afater animation completed
    swipe_slider.addEventListener('animationend', ()=>{
      swipe_slider.classList.remove('swipe-animation-demo');
    });

  }
})


/* UK-278 */
document.addEventListener("DOMContentLoaded", ()=>{

  let product_form  = document.querySelector('.product-single__details .product__form');
  let sold_out_block = product_form.querySelector('.sold-out-block');
  let email_field = sold_out_block.querySelector('input[name=email]');

  sold_out_block.querySelector('.btn').addEventListener('click', function(){

    if(this.classList.contains('processing')){
      return false;
    }

    if(!email_field.checkValidity()){
      email_field.reportValidity()
      return false;
    }

    let _this = this;
    this.classList.add('processing');

    let variant_id = product_form.querySelector('input[name=id]').value;

    let data = {
      "data": {
        "type": "back-in-stock-subscription",
        "attributes": {
          "profile": {
            "data": {
                "type": "profile",
                "attributes": {
                    "email": ""
                }
            }
          },
          "channels": ["EMAIL"],
        },
        "relationships": {
          "variant": {
            "data": {
              "type": "catalog-variant",
              "id": ""
            }
          }
        }
      }
    }
    data.data.attributes.profile.data.attributes.email = email_field.value.trim();
    data.data.relationships.variant.data.id = `$shopify:::$default:::${variant_id}`;

    var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "revision":"2024-06-15"
        },
        body: JSON.stringify(data)
    };

    fetch(`https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${theme.settings.klaviyo_api_key}`,requestOptions)
    .then(result => {
      _this.classList.add('completed');
    })

    let subscription_data = {
      "data":{
        "type":"subscription",
        "attributes":{
           "profile":{
              "data":{
                 "type":"profile",
                 "attributes":{
                    "email":""
                 }
              }
           }
        },
        "relationships":{
           "list":{
              "data":{
                 "type":"list",
                 "id":""
              }
           }
        }
      }
    }

    subscription_data.data.attributes.profile.data.attributes.email = email_field.value.trim();
    subscription_data.data.relationships.list.data.id = theme.settings.klaviyo_list_id;

    let subscription_request_data = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "revision":"2024-02-15"
        },
        body: JSON.stringify(subscription_data)
    }
    fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${theme.settings.klaviyo_api_key}`, subscription_request_data)

  })
})


document.addEventListener('DOMContentLoaded', ()=>{

  let collection_filters = document.querySelector('.collection__filters');
  let filters_toggle = document.querySelector('.collection__filters__toggle');

  if(!collection_filters || !filters_toggle){
    return false;
  }  
  
  filters_toggle.addEventListener('click', ()=>{
    if(theme.sizes.small <= window.innerWidth){
      collection_filters.classList.add('collection__filters--visible');
      themeVendor.ScrollLock.disablePageScroll();
    }
  });
  collection_filters.addEventListener('click', (e)=>{
    if(e.target.classList.contains('collection__filters')){
      collection_filters.classList.remove('collection__filters--visible');
      themeVendor.ScrollLock.enablePageScroll();
    }
  });

  document.addEventListener('theme:filters:init', ()=>{
    let filter_counter = collection_filters.querySelector('.collection__filters__top').dataset.activeFilterCounter;
    filters_toggle.querySelector('.active-filter-counter').innerHTML = filter_counter > 0 ? filter_counter : ''
  });
  
  
  document.querySelectorAll('.collection__sort-bar input[name=sort_by_bar]').forEach(item=>{
    item.addEventListener('change', (e)=>{
      
      let new_main_label = item.closest('li').querySelector('label').innerHTML;
      let old_main_label = item.closest('.collection__sort-bar').querySelector('.sort-selected-value').innerHTML = `: ${new_main_label}`;
      collection_filters.classList.add('hidden-hack');

      
      document.addEventListener('theme:scroll:lock-completed', (e)=>{
        collection_filters.classList.remove('collection__filters--visible');
        collection_filters.classList.remove('hidden-hack');
        themeVendor.ScrollLock.clearQueueScrollLocks();
        themeVendor.ScrollLock.enablePageScroll();
        document.documentElement.removeAttribute('data-scroll-locked');
      },{once:true});
      
    });
  });

  (function(){
    const callback = function(mutationsList, observer){
      for(const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-scroll-locked' && document.documentElement.hasAttribute('data-scroll-locked')) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock-completed', {bubbles: true}));
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, { attributes: true });
  })();
});

/* B2C-513 - Collection Navigation */ 
document.addEventListener('DOMContentLoaded', ()=>{

  let slider = document.querySelector('.collection-navigation .inner-wrapper-nav');
  if(!slider || slider.scrollWidth <= slider.clientWidth){
    return false;
  }

  slider.classList.add('active-slider');

  let slider_helper = new themeVendor.Flickity( slider, {
    prevNextButtons: true,
    cellAlign: 'left',
    pageDots: false,
    wrapAround: false,
    contain:true
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.isIntersecting ? slider.classList.add('arrow-right-disabled') : slider.classList.remove('arrow-right-disabled')
    });
  },{
    root: slider,
    threshold: 1.0
  });
  observer.observe(slider.querySelector('.item-nav:last-child'));
})


/* B2C-523 - Frequency Selector */
document.addEventListener('theme:variant:change',(e)=>{

  let freqency_selector_selector_parent = e.target.classList.contains('popup-quick-view__inner') ? '.popup-quick-view__body' : '.product-single';

  let data = e.detail.variant.selling_plan_allocations;
  let freqency_selector = document.querySelector(`${freqency_selector_selector_parent} .product__subs__wrap`);


  if(data.length > 0){
    //Show Frequency Selector
    freqency_selector.classList.add('active');
    freqency_selector.querySelectorAll('.actual-select input').forEach(item=>{
      item.disabled = false;
    })
  }
  else{
    //Hide  Frequency Selector
    freqency_selector.classList.remove('active');
    freqency_selector.querySelectorAll('.actual-select input').forEach(item=>{
      item.disabled = true;
    })    
  }

})


document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.product__subs__wrap select[name=selling_plan_fake]').forEach(select=>{
    select.addEventListener('change',()=>{
      let plan = select.value;
      select.closest('.subscription-selector-line').querySelectorAll('.actual-select input').forEach(actual_select=>{
        if(actual_select.value == plan){
          actual_select.checked = true;
          actual_select.dispatchEvent(new Event('change'));
        }
      })
    })
  })

  document.querySelectorAll('.product__subs__wrap .actual-select input').forEach(actual_select=>{
    actual_select.addEventListener('change',()=>{
      if(!actual_select.checked){
        return false;
      }
      let select = actual_select.closest('.subscription-selector-line').querySelector('select');
      if(select.value != actual_select.value){
        select.value = actual_select.value;
      }
    })
  })
})
/* B2C-523 - Frequency Selector - END */

