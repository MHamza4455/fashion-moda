let gwp_used_coupon;
let $gwp_product;
let $gwp_coupon_block;


/* We have different event, depends on what cart we use - "Cart Drawer" or general Cart Page */
let gwp_init_event = actuall_template_name == 'cart' ? "theme:cartpage:ready" : "theme:cart:loaded";


let appliy_coupon = false; 


let cart_previous_data = false;
let cart_new_data = false;


let gwp_request_data_collection_status = false;
let gwp_request_data = {};
let gwp_cart_requests_process = false;
function request_data_collection_release(){
  gwp_request_data_collection_status = false;
  if(!Object.keys(gwp_request_data).length){

    //We don't add any GWP items, but something may be deleted - run GWP Tier names saver
    
    gwp_applied_tires_save(true);
    return false;
  }

  //a GWP product about to be added

  let update_data_object = {
    updates:gwp_request_data
  }

  //run GWP Tier names saver
  let new_gwp_tiers = gwp_applied_tires_save();
  if(new_gwp_tiers !== false){
    //if there is any change in applied GWP tiers - save this changes
    update_data_object.attributes = {
      gwp_applied_tires: new_gwp_tiers
    }
  }

  gwp_ajax_work('update', update_data_object);
  
  gwp_request_data = {};
}



/*
  The next function checks what GWP Tiers are applied now and save (or just returns) these Tires Reporting Titles as a Cart Attribute "gwp_applied_tiers"
  We can work with this cart attribute in Shopify Flow.  
  This function is called in the "request_data_collection_release" function. Because the "request_data_collection_release" fires each time something changed in the cart and works just after all "internal" data changes are completed.
*/
let previous_gwp_applied_tires = '';
function gwp_applied_tires_save(send_data){
  let gwp_applied_tires = '';
  for(let one_settings in gwp_settings){
      let data = gwp_settings[one_settings];
      if(data.already_in_cart_count > 0){
        gwp_applied_tires+= 'GWP' + (data.gwp_type == 'coupon' ? '-Coupon' : '') + `_${data.reporting_title.replaceAll(' ','-')},`
      }
  }



  gwp_applied_tires = gwp_applied_tires.slice(0, -1);



  if(gwp_applied_tires == previous_gwp_applied_tires){
    //nothing to update
    return false;
  }

  previous_gwp_applied_tires = gwp_applied_tires;

  if(send_data){
    fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attributes: {
        "gwp_applied_tires": gwp_applied_tires,
        }
      })
    })
  }
  else{
    return gwp_applied_tires;
  }
}




document.addEventListener(gwp_init_event, (e)=>{
  console.log("GWP INITIAL LOAD");

  cart_previous_data = JSON.stringify(cart);



  let gwp_current_tier = 0;
  gwp_used_coupon = getCookie("gwp_discount");


  let $gwp_block_wrapper = document.querySelector('.gwp-wrapper');

  let $gwp_block = document.querySelector('.gwp-wrapper .gwp-block');


  let $gwp_open_button = document.querySelectorAll('.gwp-wrapper .gwp-open-button');

  $gwp_product = $gwp_block.querySelectorAll('.product-element');


  //GWP Tiers Progress Bar elements
  let $tier_progress_bar = document.querySelector('.gwp-progress-bar-wrapper');
  let $tier_progress_bar_line = $tier_progress_bar.querySelector('.helper');
  let $tier_prgress_bar_value = $tier_progress_bar.querySelector('.goal .value');
  let $tier_progress_bar_title = $tier_progress_bar.querySelector('.title');


  //Check if we need to auto-add an item from GWP tier with single item (if we meet the tier threshold)
  check_autoadd_gwp_tier();


  //Hide/Show buttons for showing GWP popup
  function check_max_gwp_items(tier){


    //Work with buttons
    if(tier.gwp_type == 'original'){
      //Original GWP system, we need to check the buttons

      //Find "Open" button And Decided what to do with it
      $gwp_open_button.forEach(item=>{
        if(item.classList.contains('gwp-open-button-tier-'+tier.id)){

          if(tier.already_in_cart_count  < tier.max_gwp_items){
            item.classList.add('show-flex');
          }
          else{
            item.classList.remove('show-flex');
          }

        }
      })
    }

    
    if(tier.already_in_cart_count >= tier.max_gwp_items){

      //Close popup, if this popup is open
      if($gwp_block.dataset.tier_id == tier.id){
        $gwp_block.classList.remove('active');
      }


      //Change applied coupon info text to "Completed"
      if(tier.gwp_type == 'coupon'){
        gwp_coupon_validation_status({'gwp':'complete'});
      }
    }


    //Change available GWP products
    $gwp_block.querySelector('.available-gwp-count').innerHTML = tier.max_gwp_items - tier.already_in_cart_count;
  }







  //Add GWP product to the cart
  $gwp_block.querySelectorAll('.products-list .add').forEach(item=>{
    item.addEventListener('click', function(){

      //Prevent Double Click
      if(item.classList.contains('process')){
        return false;
      }
      item.classList.add('process');


      //Get needed params
      let $block = item.closest('.product-element');
      //Current Tier??
      let tier_id = item.closest('.gwp-block').dataset.tier_id;    


      //Check what we need to do - select or unselect
      if($block.classList.contains('gwp-selected')){
        //Delete item
        gwp_settings[tier_id].already_in_cart_count--;

        let updates = {};
        updates[$block.dataset.id] = 0;
        
        gwp_ajax_work('update',{updates:updates}, function(){
          item.classList.remove('process');
        });
      
      }
      else{
        //Add Item
        gwp_settings[tier_id].already_in_cart_count++;


        //Remove Item From "Don't Auto Add" list
        gwp_previously_removed_remove($block.dataset.id);


        gwp_ajax_work('add',{id:$block.dataset.id,quantity:1}, function(){
          item.classList.remove('process');
        });

        /*
          After addin a new element, check how it affected the GWP system.
          BTW, we don't need this check when we delete an element from GWP
        */
        check_max_gwp_items(gwp_settings[tier_id]);

        //Check if we need to hide GWP block at all (because we might not have any content in that block);
        check_gwp_block_visibility();
      }


      //Select or Unselect product
      $block.classList.toggle('gwp-selected');
    })
  })



  



  //Check the gwp system each time the cart has some changes
  document.addEventListener('theme:cart:added', function(e){

    /*
      Check if something were changes in the cart data
      Otherwise we dont' need to run validation process.
      In some situation this event triggered without acutaly change
    */

    cart_new_data = JSON.stringify(cart);
    if(cart_new_data == cart_previous_data){
      console.log("Cart - Something is updated, but all the same");
      return false;
    }
    cart_previous_data = cart_new_data; 


    /*
      Some changes were actually applied
      So we need to validate everything delete/add something and reapply discount code
    */

    console.log("Cart - Somthing is updated");



    cart_items_gwp = [];
    cart.items.forEach(item=>{
      cart_items_gwp.push({
        id: Number(item.dataset.item.split(':')[0]),
        quantity:Number(item.querySelector('input.cart__item__quantity-field').value)
      });
    });



    let closest_threshold = 0;


    $gwp_product.forEach(item=>{
      item.classList.remove('gwp-selected');
    })

    
    //Recalculate GWP Items In Cart
    for(let tier_id in gwp_settings){

      let tier = gwp_settings[tier_id];
      
      gwp_settings[tier_id].already_in_cart_count = 0;


      cart_items_gwp.forEach(item=>{
        if(tier.products.includes(item.id)){
          gwp_settings[tier_id].already_in_cart_count++;

          let $variant = $gwp_block.querySelector('.variant-id-'+item.id);
          $variant.classList.add('gwp-selected');
        }      
      });


      //Check what buttons should we add/hide + close the active popup if needed
      check_max_gwp_items(tier);
      

      /*
        Next Steps actuall only for GWP Original System
        Work with GWP button & GWP Threshold Bar
      */     
      if(tier.gwp_type != 'original'){
        continue;
      }

    
      //Change - get current tier and work with it later REBUILD
      //Check Tier Progress Bar if 
      if(cart.subtotal < tier.threshold && closest_threshold == 0 && !tier.hide_progress_bar){
        closest_threshold = tier.threshold;
        $tier_progress_bar_title.innerHTML = tier.title;
        $tier_progress_bar.querySelector('.end').innerHTML = rc_money_format(tier.threshold);
      }


      //Check what Original GWP Buttons we should hide/show
      if(!gwp_tier_conditions_check(tier)){
        $gwp_open_button.forEach(item=>{
          if(item.classList.contains('gwp-open-button-tier-'+tier.id)){
            item.classList.remove('show-flex');
          }
        })
      }
    }



    /*
      Start Request Collector
      On the next step we may Add/Delete several product at once
      To avoid async request conflict we need to collect all data that we will change
      and sent it in one request.
      The "request_data_collection_release" function send this request
      and "gwp_request_data_collection_status" variable tells "gwp_ajax_work" function that we only Collect request data for now
    */ 
    gwp_request_data_collection_status = true;


    if(appliy_coupon){
      //Apply Coupon if this function exists
      appliy_coupon();
    }

    //Run big test of GWP system condition (gwp items count/quantity, threshold)
    gwp_system_super_check();

    // Check if we reach a tier with one product and we need to auto-add this product 
    check_autoadd_gwp_tier();

    request_data_collection_release();

    /* END Request Collector */



    
    //Work With Tier Progress Bar
    if(closest_threshold){
      $tier_progress_bar.classList.add('show-flex');
      $tier_progress_bar_line.style.width = (cart.subtotal / closest_threshold)*100+'%';
      $tier_prgress_bar_value.innerHTML = rc_money_format(closest_threshold - cart.subtotal);
    }
    else{
      $tier_progress_bar.classList.remove('show-flex');
    }


    //Check if we need to hide GWP block at all
    check_gwp_block_visibility();
  });


  /*
    Function checks if we reach a tier with one product and we need to auto-add this product 
    + It should be original GWP tier, not coupon one
  */
  function check_autoadd_gwp_tier(){
    let add_data = {};

    //Recalculate GWP Items In Cart
    for(let tier_id in gwp_settings){
      let tier = gwp_settings[tier_id];


      if(tier.gwp_type == 'original' && tier.products.length == tier.max_gwp_items && gwp_tier_conditions_check(tier)){

        gwp_settings[tier_id].already_in_cart_count = 0;
        
        tier.products.forEach(one_product=>{
          /*
            For auto-add something, check
            1. The product wasn't already addded
            2. The product wasn't manually removed before
          */
          if(cart_items_gwp.every(item=>{return item.id != one_product}) && !gwp_previously_removed_check([one_product])){
            gwp_settings[tier_id].already_in_cart_count++;//this sum works only for items that we are adding right now
            add_data[one_product] = 1;
          }


          // Check how many items we already has in the cart
          gwp_settings[tier_id].already_in_cart_count += cart_items_gwp.reduce((result, item)=>{
            return item.id == one_product ? result + 1 : result;
          },0)


        })
      }

    }

    //Add auto-added GWP
    if(Object.keys(add_data).length){
      gwp_ajax_work('update',{updates:add_data});
    }    
  }


  /* Popup Work */
  $gwp_open_button.forEach(item=>{
    //Get needed tier for popup
    item.querySelector('.gwp-button').addEventListener('click', function(){
      let tier = this.dataset.tier;

      if(!tier){
        //We can't show popup if we don't have tier
        return false;
      }

      //Show Popup with Selected Tier
      show_gwp_popup(gwp_settings[tier], $gwp_block);
    })
  })




  /*
    Show Popup with GWP item
    we have $gwp_popup because it also works with GWP Coupon system
  */
  function show_gwp_popup(gwp_object, $gwp_popup){

    $gwp_popup.querySelector('h2').innerHTML = gwp_object.title; //Change popup header


    if(gwp_object.max_gwp_items - gwp_object.already_in_cart_count > 1){
      $gwp_popup.querySelector('.information').classList.remove('single')
      $gwp_popup.querySelector('.information').classList.add('multiple');

      $gwp_popup.querySelector('.available-gwp-count').innerHTML = gwp_object.max_gwp_items - gwp_object.already_in_cart_count;
    }
    else{
      $gwp_popup.querySelector('.information').classList.remove('multiple')
      $gwp_popup.querySelector('.information').classList.add('single');
    }

    let tier_products_count = gwp_object.products.length;


    $gwp_popup.classList.remove("gwp-count-1", "gwp-count-2", "gwp-count-3");
    $gwp_popup.classList.add("active", "gwp-count-"+tier_products_count);
    
    $gwp_popup.querySelectorAll('.tier-content').forEach(item=>{
      item.classList.remove("show");
    });


    $gwp_popup.querySelector('.tier-'+gwp_object.id+'-content').classList.add('show');
    

    $gwp_popup.dataset.tier_id = gwp_object.id;


    let $slider = $gwp_popup.querySelector('.tier-'+gwp_object.id+'-content .products-list')

    //Create Slider only if we have "desktop" resolution
    if(window.matchMedia('(min-width: 768px)').matches && (document.querySelector('.livingproof-style.hide-header') || (!document.querySelector('.livingproof-style.hide-header') && tier_products_count > 3))){
      let rc_slider_link = new themeVendor.Flickity( $slider, {
        cellAlign: 'left',
        contain: true,
        pageDots: false,
        groupCells: true,
        dragThreshold:3
      });
      rc_slider_link.resize();
    }
  }


  //Popup controls
  $gwp_block.addEventListener('click', (e)=>{
    if(!e.target.closest('.content')){
      $gwp_block.classList.remove('active');
    }
  })
  $gwp_block.querySelector('.icon-close').addEventListener('click',function(){
    this.closest('.gwp-popup').classList.remove('active');
  })







  //Close popup by "esc" button
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" || event.keyCode === 27){
      document.querySelector('.gwp-popup.active')?.classList.remove('active');
    }
  });

  /* END Popup Work */



  function check_gwp_block_visibility(){
    if($gwp_block_wrapper.querySelectorAll('.show-flex').length){
      if($gwp_block_wrapper.classList.contains('make-hidden')){
        $gwp_block_wrapper.classList.remove('make-hidden');
        document.dispatchEvent(new Event('cart-drawer-size-change'));
      }
    }
    else{
      if(!$gwp_block_wrapper.classList.contains('make-hidden')){
         $gwp_block_wrapper.classList.add('make-hidden');
        document.dispatchEvent(new Event('cart-drawer-size-change'));
      }      
    }     
  }





  /* GWP Coupon */
  $gwp_coupon_block = document.querySelector('.gwp-coupon-block');




  /* Run this code only if we have Coupon Block on the page */
  if($gwp_coupon_block){


    let $coupon_field = $gwp_coupon_block.querySelector('.gwp_coupon_field');


    /* 
      appliy_coupon - responsible for applying coupon when a user initially inserts it
      + each time something changed in the cart (because we need to check thresholds)
      + after page initially loaded 
    */
    appliy_coupon = function(user_action){

      let code = $coupon_field.value.trim().toLowerCase();
      if(!code){
        return false;
      }
      console.log('Apply Coupon');


      /* Validation Process */

      let active_gwp_coupon = false;
      let lowest_threshold = 1000000000;
      let gwp_code_exists = false;
      let something_was_applied = false;

      let info_message = 'invalid';
      let info_message_data;

      let active_code_related_to_gwp_with_item_criteria = false;

      /* Check if the applied code exists in GWP Coupon System */
      for(let gwp_coupon_index in gwp_settings){
        let gwp_coupon = gwp_settings[gwp_coupon_index];

        if(gwp_coupon.code == code){
          gwp_code_exists = true; //Code Exists in GWP Coupon System


          /*
            Check if exits code related to GWP Tier with Item criteria
            We need it to:
            1. Exclude this Tier from lowest threshold calculation
            2. Show specific message for this type of tier
          */
          active_code_related_to_gwp_with_item_criteria = gwp_coupon.items_condition_amount > 0;


          /* Check if the Code meets threshold criteria */
          if(gwp_tier_conditions_check(gwp_coupon)){
            //Code meets threshold criteria
            active_gwp_coupon = gwp_coupon;
            /* 
              There may be 2 situation - 
              1. We have 1 GWP items and will be auto-added, so the validation status shoud be - "Complete"
              2. We have more than 1 GWP items, and they won't be auto-added, so the validation status should be - "Select"
            */
            info_message = (active_gwp_coupon.products.length === active_gwp_coupon.max_gwp_items && !gwp_previously_removed_check(active_gwp_coupon.products)) || active_gwp_coupon.already_in_cart_count >= active_gwp_coupon.max_gwp_items ? 'complete' : 'select'
          }
          else{
            /* 
              Code doesn't meet threshold criteria.
              We should save the problem threshold to show it in the validation message
            */
            lowest_threshold = lowest_threshold > gwp_coupon.threshold ? gwp_coupon.threshold : lowest_threshold;


            //don't count lowest_threhsold for gwp with item criteria

          }
        }
      }


      if(gwp_code_exists && !active_gwp_coupon){
        /* GWP Code exists but has some problem with validation conditions (threshold or items condition) */

        if(active_code_related_to_gwp_with_item_criteria){
          //Code related to GWP with items condition - we have simple message in this case
          info_message = 'items-condition-problem';
        }
        else{
          //Code related to GWP with items condition and cart total lower then GWP Tier Threshold condition
          info_message = "threshold";
          info_message_data = lowest_threshold;
        }        
      }



      /*
        Internal Validation is over. Now we can work with Actually Applied Coupon
      */
      if(active_gwp_coupon){

        something_was_applied = true;


        /* This coupon works at least on GWP Level, so we need to save it for further use */
        gwp_used_coupon = code;
        setCookie("gwp_discount", gwp_used_coupon);
        $coupon_field.disabled = true;
        $gwp_coupon_block.classList.add('coupon-activated');
        


        something_was_applied = true;

        if(active_gwp_coupon.products.length > active_gwp_coupon.max_gwp_items || gwp_previously_removed_check(active_gwp_coupon.products)){

          //Show Popup, if we have more than 1 product
          if(user_action){
            show_gwp_popup(active_gwp_coupon, $gwp_block);
          }
          //Try To Apply Shopify Discount 
          apply_discount_to_shopify();                  
        }
        else{
          /*
            Auto add if the Amount of Products on the GWP Tier == Max Amount of Products a user can add on the GWP Tier
            + Non of these product were manually deleted previously
          */
          /*
            Check if some products already exists in the cart
            This may happens due to asyc requests.
            I don't know if it may actually happens after I added "Request Collector", but this sever lines of code don't bother us
          */


          let updates = {};
          let already_added_all = true;
          active_gwp_coupon.products.forEach(gwp_item=>{
            if(!cart_items_gwp.some(item => item.id == gwp_item) && !gwp_previously_removed_check([gwp_item])){
              //Not Added -> Add
              already_added_all = false;
              updates[gwp_item] = 1;
            }
          })

          if(already_added_all){
            console.log("For Some Reason, all tier's products already in the cart (or were manually deleted), interesting");
            /* If the product already in the cart, we still need to try to apply Shopify Discount */

            apply_discount_to_shopify();
            return false;
          }




          gwp_ajax_work('update',
            {updates:updates},
            apply_discount_to_shopify, //Actuall Apply the discount, after we added 1 GWP product by coupon (To avoid situation where we send 2 requsets in 1 time and they block each other)
            true //Don't need Cart Block Update before apply Shopify Discount Code
          );
        }
      }
      else{
        /* Even if the code doesn't exist in GWP Coupon System, we need to try to Apply It to Shopify Discount System */

        apply_discount_to_shopify();
      }



      //Actuall Apply the discount
      function apply_discount_to_shopify(){

        gwp_coupon_validation_status("applying");


        let shopify_discount_last_try = getCookie("shopify_discount_last_try")
        
        if(shopify_discount_last_try == code){
          console.log('Code Was Sent Earlier')
          apply_shopify_discount_after();
        }
        else{
          console.log("Code Is Sent")

          let discount_apply_url = "/checkout?discount="+code;
          fetch(discount_apply_url)
          .then(response => shoprify_discount_response_action())
          .catch(error => shoprify_discount_response_action());

          function shoprify_discount_response_action(){
            setCookie("shopify_discount_last_try", code);
            cart.getCart(); //Send Rquest for cart rebuild after code apply
            /* Wait for the response of code applying */
            document.addEventListener('theme:cart:added', function(e){
              //We get the response -> Check the result
              apply_shopify_discount_after();
            },{once:true})
          }

        }



        function apply_shopify_discount_after(){
          let shopify_discount_active = false;
          let shopify_discount_info_message = 'invalid';
          /*
            Check if the code was applied
            We store date in Section, that we recive from cart API call
            + In the Discount Block (because this block loaded from the begining)
          */
          document.querySelectorAll('.applied_discount_codes').forEach(item=>{
            if(item.textContent.split(',').includes(code)){
              shopify_discount_active = true;
              shopify_discount_info_message = 'shopify-discount';
            }
          })

          if(shopify_discount_active){
            gwp_used_coupon = code;
            setCookie("gwp_discount", gwp_used_coupon);
            $coupon_field.disabled = true;
            $gwp_coupon_block.classList.add('coupon-activated');
          }


          gwp_coupon_validation_status({
            'shopify_discount':shopify_discount_info_message,
            'gwp':info_message
          }, info_message_data)       
        }

      }

    }








    //Check If the coupon was already used
    if(gwp_used_coupon){
      
      $coupon_field.value = gwp_used_coupon;
      $coupon_field.disabled = true;
      $gwp_coupon_block.classList.add('coupon-activated');

      //Check if a user selects all products
      appliy_coupon();
    }


    //Accordion work
    $gwp_coupon_block.querySelector('.head').addEventListener('click', (e)=>{
      $gwp_coupon_block.classList.toggle('open');
    });


    //event triger when the coupon block is opened
    $gwp_coupon_block.addEventListener('transitionend',(e)=>{
      if(e.propertyName == 'max-height' && $gwp_coupon_block.classList.contains('open')){
        document.dispatchEvent(new Event('gwp-coupon-block-open'))
      }
    })


    //Delete Code
    $gwp_coupon_block.querySelector('.clear').addEventListener('click', (e)=>{
      $coupon_field.disabled = false;
      $coupon_field.value = '';
      $gwp_coupon_block.classList.remove('coupon-activated');
      setCookie("gwp_discount", '');



      setCookie("shopify_discount_last_try", '')
      gwp_used_coupon = false;


      let discount_apply_url = "/checkout?discount=''";
      fetch(discount_apply_url)
      .then(response=>shoprify_discount_clear_response_action())
      .catch(error=>shoprify_discount_clear_response_action())


      function shoprify_discount_clear_response_action(){
        //Delete products
        let at_least_one_deletion = false;

        for(gwp_tier in gwp_settings){
          if(gwp_settings[gwp_tier].gwp_type == 'coupon' && gwp_settings[gwp_tier].code == gwp_used_coupon){
            //Delete all GWP products
            at_least_one_deletion = delete_tier_products(cart_products, gwp_settings[gwp_tier]) ? true : at_least_one_deletion
          }
        }

        if(!at_least_one_deletion){
          //If we didn't delete any product -> We need to call "cart" block refresh function
          cart.getCart();
        }

      }



      //Clear validation status
      document.querySelector('.gwp-coupon-block .validation').classList.remove('active');
    })

    //Show popup to applied coupon
    $gwp_coupon_block.querySelector('.show-gwp-coupon-popup').addEventListener('click', (e)=>{
      $gwp_coupon_block.querySelector('.apply-button').click();
    })


    //Apply Coupon by clicking on "Apply" button in the "Free Gift" block 
    $gwp_coupon_block.querySelector('.apply-button').addEventListener('click', function(){
      appliy_coupon(true)
    });

    $coupon_field.addEventListener("keydown", (e)=>{
      if(e.keyCode == '13'){
        appliy_coupon(true);
        e.preventDefault();
        return false;
      }
    })



  }

});






//Show needed validation status in the GWP Coupon section
function gwp_coupon_validation_status(status, data){


  let $validation_status = document.querySelector('.gwp-coupon-block .validation');

  //For some reason we don't have coupon validation element - so we shouldn't do anything
  if(!$validation_status){
    return false;
  }

  $validation_status.classList.add('active');


  //Hide "General" validation message
  $validation_status.querySelectorAll('.invalid,.applying').forEach(item=>{

    item.classList.remove('active');
  })




  if(status.gwp == 'invalid' && status.shopify_discount == 'invalid'){
    status = 'invalid';
  }

  //Check if we need to show "General" validation message
  if(status == 'applying' || status == 'invalid'){
    $validation_status.querySelectorAll('.active').forEach(item=>{
      item.classList.remove('active');
    });
     $validation_status.querySelector('.'+status).classList.add('active');
     return true;
  }


  if(status.gwp){
    $validation_status.querySelector('.gwp-related.active')?.classList.remove('active');
    $validation_status.querySelector('.gwp-related.'+status.gwp)?.classList.add('active');
    if(status.gwp == 'threshold'){
      $gwp_coupon_block.querySelector('.threshold .value').innerHTML = rc_money_format(data);
    }
  }


  if(status.shopify_discount){
    $validation_status.querySelector('.shopify-discount-related.active')?.classList.remove('active');
    $validation_status.querySelector('.shopify-discount-related.'+status.shopify_discount)?.classList.add('active');
  }

}






function rc_money_format(value){
  return rc_currency_symbol  + (value/100).toFixed(2);
}


/* GWP Coupon END*/


//Run Global GWP checks each time the cart synced (sync code in the assets/theme.js)
document.addEventListener('cart-synced', (e)=>{
  if(!gwp_cart_requests_process){
    gwp_system_super_check(e.detail.data.items);
  }
});


//Global check of all condition for GWP tiers (items count/quantity + threshold)
function gwp_system_super_check(cart_items){

  cart_items = cart_items ? cart_items : cart_items_gwp.map(item => item.id);

  for(offer_id in gwp_settings){

    let offer = gwp_settings[offer_id]; 

    //check thresold
    if(!gwp_tier_conditions_check(offer)){
      //Delete all Tier Products
      delete_tier_products(cart_items, offer);
      continue;
    }


    //Check Max Amount & quantity
    let result_amount = 0;
    let quantity_problem = false;
    cart_items.forEach((item)=>{
      if(offer.products.includes(item.id)){
        //it's gwp product
        result_amount++;
        if(item.quantity > 1){
          //Delete all Tier products
          quantity_problem = true;
        }
      }
    });


    if(quantity_problem){
      delete_tier_products(cart_items, offer)
      continue;
    }

    if(offer.max_gwp_items < result_amount){
      //Delete all Tier products
      delete_tier_products(cart_items, offer)
      continue;
    }

    //Check Coupon
    if(offer.gwp_type == 'coupon' && offer.code != gwp_used_coupon){
      //Delete all Tier products
      delete_tier_products(cart_items, offer);
      continue;
    }

  }
}





  //Remove all products from the chosen tier
  function delete_tier_products(cart_products, tier){



    let updates = {};
    let delete_something = false;

    cart_products.forEach((cart_product)=>{
      if(tier.products.includes(cart_product.id)){

        updates[cart_product.id] = 0;
        delete_something = true;

        //Unselect this product in popup
        $gwp_product.forEach(item=>{
          if(item.classList.contains('variant-id-'+cart_product.id)){
            item.classList.remove('gwp-selected');
          }
        })
      }
    });

    gwp_settings[tier.id].already_in_cart_count = 0;
    if(delete_something){
      gwp_ajax_work('update',{updates:updates});
      return true;
    }     
  }







//Function adds product to the cart via AJAX
function gwp_ajax_work(action, data, callback, without_cart_update = false){


  if(gwp_request_data_collection_status == true){
    for(product_id in data['updates']){
      gwp_request_data[product_id] = data['updates'][product_id];
    }
    return false;
  }
  gwp_cart_requests_process = true;


  fetch("/cart/"+action+".js",{
    "method":"POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => {      
    /* 
      Rebuild Cart, if specifically not said - do not rebuild cart
    */
    if(!without_cart_update){
      cart.getCart();
    }

    //Run Callback function, if it exists
    if(callback){
      callback();
    }
    gwp_cart_requests_process = false;
  }).catch((error) => {
    gwp_cart_requests_process = false;
  })
}


/*
  getCookie & setCookie defined in the "custom.js" file
*/


/* GWP Tier Conditions Check
  2 Criteria:
  1. Threshold
  2. Specific Item Condition
*/
function gwp_tier_conditions_check(tier){

  let cart_total = tier.gwp_type == 'original' ? cart.subtotal : Number(cart.cartForm.querySelector('[data-cart-total-prediscount]').dataset.cartTotalPrediscount)


  let threshold_condition = cart_total >= tier.threshold && (!tier.threshold_max || cart_total < tier.threshold_max);

  let items_condition = tier.items_condition.reduce((accumulator, item)=>{
    return accumulator+= cart_items_gwp.some(cart_item=>{
      return cart_item.id == item;
    });
  }, 0);
  items_condition = items_condition >= tier.items_condition_amount;

  return threshold_condition && items_condition
}



/* Catch Deleted GWP */
document.addEventListener('click', (e)=>{
   let element = e.target;
   if(element.hasAttribute('data-item-remove') || element.parentElement.hasAttribute('data-item-remove')){
    let gwp = element.closest('.gwp-cart-item');
    if(gwp){
      let removed_id = gwp.dataset.item.split(':')[0]
      let removed_array = JSON.parse(localStorage.getItem('gwp-removed-items')) || [];
      if(!removed_array.includes(removed_id)){
        removed_array.push(removed_id);
        localStorage.setItem('gwp-removed-items', JSON.stringify(removed_array));
      }
    }
   }
})


/*
  Check if products was manually removed
  Return TRUE if one of ids (array) were removed
*/
function gwp_previously_removed_check(ids){
  let removed_array = JSON.parse(localStorage.getItem('gwp-removed-items')) || [];
  return ids.some(item=>{
    return removed_array.includes(String(item));
  }) 
}

function gwp_previously_removed_remove(id){
  let removed_array = JSON.parse(localStorage.getItem('gwp-removed-items')) || [];
  removed_array = removed_array.filter(item=>{
    return item != id; 
  });
  localStorage.setItem('gwp-removed-items', JSON.stringify(removed_array));
}













function check_what_gwps_are_applied(){


  //send cart.js request



  /*

    Протестировать, как работает удаление через REMOVE ITEM

  */
}
