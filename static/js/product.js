
function getCurrentPlan() {

  admin.subscription.getCurrentPlan({
      onSuccess: (data) => {
              //console.log(data);
              if(data.status == 'success') {
                let d = data.data;
                let temp = `<i class="fa fa-info-circle"></i>&nbsp;
                You are currently on a <strong>${d.title} Plan</strong> for <strong>${d.duration}</strong> and 
                ${d.expired ? `it expired` : `will expire`} on <strong>${datify(d.expiry_date, false)}</strong>. 
                Select any plan below to extend your subscription.`;
                $(".plan-alert").html(temp)
              }
              else {
                pushNotification("n_error", data.message, 3000)
              }
      },
      onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
      }
})
}

function getProducts() {
    showLoader("Loading Products...")
    $(".product-list").empty();
    admin.product.list({
        onSuccess: (data) => {
            console.log(data);
            if(data.status == 'success') {
                let d = data.data;
                if(d.length > 0) {
                  for(let i in d) {
                    let temp = `
                    <div class="product-card">
                      <div class="main-images">
                        <img id="expandedImg_${d[i].id}" class="active" src="${base_url}${d[i].image}">
                      </div>
                      <div class="shoe-details">
                        <span class="shoe_name">${d[i].title}</span>
                        <p>${truncateWord(d[i].description, 100)}</p>
                        
                      </div>
                      <div class="color-price">
                        <div class="color-option">
                          <span class="color">Type:</span>
                          <div class="circles">
                            ${d[i].product_type}
                          </div>
                        </div>
                        <div class="price">
                          <span class="price_num">&#8358;${digify(d[i].price)}</span>
                        </div>
                      </div>

                      <div class="row">
                        ${d[i].images.map((item, index) => {
                          return `<div class="column">
                          <img data-id="${d[i].id}" src="${base_url}${item.image}" alt="${item.title}">
                          </div>`
                        }).join('')}
                      </div>

                      <div class="w-flex w-flex-around w-align-center" style="gap:15px;">
                        <div class="button">
                          <div class="button-layer"></div>
                          <button class="pro-det-btn" data-id='${JSON.stringify(d[i])}'>View Info</button>
                        </div>
                        <div class="button">
                          <div class="button-layer"></div>
                          <button>Buy Now</button>
                        </div>
                      </div>
                    </div>`
                    $(".product-list").append(temp)
                  }

                  $(".column img").click(function() {
                    let id = $(this).data('id')
                    let image = $(`#expandedImg_${id}`);
                    image.addClass('w-animate-fade')
                    image.attr('src', $(this).attr('src'))
                  })

                  $(".pro-det-btn").click(function() {
                    let obj = $(this).data('id');
                    showProduct(obj)
                  })
                }
                else {
                  let temp = `<h4 class="w-text-gray">No products available.</h4>`
                  $(".product-list").append(temp)
                }
            }
            else {
                pushNotification("n_error", data.message, 3000);
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            hideLoader()
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

//getCurrentPlan()
getProducts()


function getPlan(plan_id) {
  showLoader("Processing...")
    admin.subscription.getSubscriptions({
      params: {plan_id},
        onSuccess: (data) => {
            //console.log(data);
            if(data.status == 'success') {
                let d = data.data;
                $("#titley").html(d.title)
                $(".sub-price.monthly .h2").html(`&#8358;${digify(d.monthly_price)}`);
                $(".sub-price.quarterly .h2").html(`&#8358;${digify(d.quarterly_price)}`);
                $(".sub-price.biannually .h2").html(`&#8358;${digify(d.biannual_price)}`);
                $(".sub-price.annually .h2").html(`&#8358;${digify(d.yearly_price)}`);
                $("#sub-plan-id").val(plan_id);
              updateSteps(null, 2)
            }
            else {
                pushNotification("n_error", data.message, 3000);
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            hideLoader()
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
  
}





// ========== Event Listeners ======================
$(".gen-payroll-btn").click(function(e) {e.preventDefault();generatePayroll()})
$(".add-bank-btn").click(function(e) {e.preventDefault();$(".add-bank-con").addClass("active")})


$(".pay-trans-form").on('submit', function(e) {e.preventDefault();makePayment()})

