showLoader("Loading profile...")

async function getProfile() {
  try {
    let data = await cache.fetchOrCache({
      func: "admin.account.getProfile",
      fetcher: admin.account.getProfile
    })

    if(data.status == "success") {
                let d = data.data
                $("#p-fname").val(d.firstName);
                $("#p-lname").val(d.lastName);
                $("#p-email").val(d.email);
                $("#p-phone").val(d.phone_number);
              }
              else {
                pushNotification("n_error", data.message, 4000)
              }
              hideLoader()
  }
  catch(error) {
    console.error(error);
    hideLoader()
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}

async function schoolConfig() {
  try {
    let data = await cache.fetchOrCache({
      func: "admin.school.config",
      fetcher: admin.school.config
    })

    let d = data.data
              
              $("#config-renew").val(d.auto_renewal.toString());
              $("#config-payroll").val(d.auto_payroll.toString());
              $("#config-cbt").val(d.cbt_verification.toString());
              $("#config-date").val(d.payroll_date);
              $("#config-term").val(d.term_per_session);
              $("#config-week").val(d.weeks_per_term);
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}

function getCBT() {
    $(".new-port").hide();
    $(".old-port").hide();
    admin.product.cbt({
        onSuccess: (data) => {
            //console.log(data);
            if(data.status == 'success') {
                let domain_temp = ``
                if(data.data) {
                    let d = data.data;
                    $(".new-port").hide();
                    $(".old-port").show();
                    if(d.resolved) {
                        domain_temp = `
                        <div class="alert alert-success">
                        <i class="fa fa-check-circle"></i>&nbsp;&nbsp;
                        Your school CBT software has been approved and your software is now active!
                        </div>`
                    }
                    else {
                        domain_temp = `
                        <div class="alert alert-warning">
                        <i class="fa fa-clock-o"></i>&nbsp;&nbsp;
                        Your school CBT software is being processed at the moment. Kindly note that request can take up to 3 business days for approval.
                        </div>`
                    }
                    $("#cbt-emails").html(d.allowed_emails.join(', '))
                    $("#cbt-date").html(datify(d.created, true))
                    $("#cbt-stat").html(d.resolved ? `Approved` : `Pending`)
                    $("#cbt-ops").html(d.os)
                    $("#cbt-ver").html(`${d.major_version}.${d.minor_version}.${d.patch_version}`)
                    $("#cbt-app").html(d.updated ? datify(d.updated, false) : 'N/A')
                    if(d.file) {
                      $(".cbt-link").html(`
                        <button class="cbt-down-btn dark-btn" data-id="${d.file}">Download CBT Software</button>
                        
                      `)
                    }

                    $(".cbt-down-btn").click(function() {
                      let link = $(this).data('id');
                      downloadFile(link)
                    })
                }
                else {
                    let p = data.product;
                    $(".new-port").show();
                    $(".old-port").hide();
                    domain_temp = `
                    <div class="alert alert-warning">
                    <i class="fa fa-warning"></i>&nbsp;&nbsp;
                    ${data.message}
                    </div>`;

                    let temp = `
                    <div class="product-card">
                      <div class="main-images">
                        <img id="expandedImg_1" class="active" src="${base_url}${p.image}">
                      </div>
                      <div class="shoe-details">
                        <span class="shoe_name">${p.title}</span>
                        <p class="shoe_des">${p.description}</p>
                        
                      </div>
                      <div class="color-price">
                        <div class="price">
                          <span class="price_num">&#8358;${digify(p.price)}</span>
                        </div>
                      </div>

                      <div class="row">
                        ${p.images.map((item, index) => {
                          return `<div class="column">
                          <img data-id="${p.id}" src="${base_url}${item.image}" alt="${item.title}">
                          </div>`
                        }).join('')}
                      </div>

                      <div class="w-flex w-flex-around w-align-center w-flex-wrap" style="gap:15px;">
                        
                        <div class="button">
                          <div class="button-layer"></div>
                          <select id="cbt-os">
                            <option class="w-text-black" value="">Select Operating System</option>
                            <option class="w-text-black" value="windows">Windows OS (8, 10, 11)</option>
                            <option class="w-text-black" value="linux">Linux OS (Ubuntu, Fedora, Debian, Kali, etc)</option>
                          </select>
                        </div>
                        <div class="button">
                          <div class="button-layer"></div>
                          <button class="buy-cbt-btn">Buy Now</button>
                        </div>
                      </div>
                    </div>`
                    $(".cbt-con").html(temp)

                    $(".column img").click(function() {
                        //let id = $(this).data('id')
                        let image = $(`#img01`);
                        //image.addClass('w-animate-fade')
                        $(".lightbox").addClass("active")
                        image.attr('src', $(this).attr('src'))
                        $("#caption").html($(this).attr('alt'))
                      })

                      $(".buy-cbt-btn").on('click', function(e) {
                        e.preventDefault();
                        let os = $("#cbt-os").val();
                        cbt_checkout(os)
                    })
    
                      $(".pro-det-btn").click(function() {
                        let obj = $(this).data('id');
                        showProduct(obj)
                      })
                }
                $(".domain-alert").html(domain_temp)
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

getProfile()
schoolConfig()
getCBT()

function updateProfile() {
  let phone_number = $("#p-phone").val();

  formData = {phone_number};
  
  showLoader("Updating profile...")

  admin.account.updateProfile({
      formData: formData,
      onSuccess: async (data) => {
          if(data.status == 'success') {
              pushNotification("n_success", data.message, 5000);
              await cache.refresh("admin.account.getProfile", {}, admin.account.getProfile)
          }
          else {
              pushNotification("n_error", data.message, 5000)
          }
          hideLoader()
      },
      onError: (error) => {
          console.error(error);
          pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
          hideLoader()
      }
  })
}

function updatePassword() {
  let old_password = $("#old-pass").val();
  let new_password = $("#new-pass").val();
  let cnew_password = $("#cnew-pass").val();

  if(old_password.trim() == "" || new_password.trim() == "") {
    pushNotification("n_warning", "Password field cannot be empty!", 3000);
    return
  }
  if(new_password !== cnew_password) {
    pushNotification("n_warning", "Passwords do not match!", 3000);
    return
  }

  formData = {old_password, new_password};
  
  showLoader("Updating profile...")

  admin.account.changePassword({
      formData: formData,
      onSuccess: (data) => {
          if(data.status == 'success') {
              pushNotification("n_success", data.message, 5000);
              $(".change-pass-form")[0].reset();
          }
          else {
              pushNotification("n_error", data.message, 5000)
          }
          hideLoader()
      },
      onError: (error) => {
          console.error(error);
          pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
          hideLoader()
      }
  })
}

function updateConfig() {
  let auto_payroll = $("#config-payroll").val();
  auto_payroll = (auto_payroll == "true");
  let auto_renew = $("#config-renew").val();
  auto_renew = (auto_renew == "true");
  let cbt_verification = $("#config-cbt").val()
  cbt_verification = (cbt_verification == "true");
  let payroll_date = $("#config-date").val();
  let term_per_session = $("#config-term").val();
  let weeks_per_term = $("#config-week").val()

  formData = {auto_payroll, cbt_verification, auto_renew, payroll_date, term_per_session, weeks_per_term};
  
  showLoader("Updating configurations...")

  admin.school.updateConfig({
      formData: formData,
      onSuccess: async (data) => {
          if(data.status == 'success') {
              pushNotification("n_success", data.message, 5000)
              await cache.refresh("admin.school.config", {}, admin.school.config)
          }
          else {
              pushNotification("n_error", data.message, 5000)
          }
          hideLoader()
          schoolConfig()
      },
      onError: (error) => {
          console.error(error);
          pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
          hideLoader()
      }
  })

}

function cbt_checkout(os) {
    if(os.trim() == "") {
        pushNotification("n_info", "Kindly select an operating system for your CBT software", 5000);
        return;
    }

    showLoader("Initiating payment...")

  admin.product.cbtCheckout({
      formData: {os},
      onSuccess: (data) => {
        //console.log(data)
          if(data.status == 'success') {
            let d = data.data;
            let t = data.transaction;

            $("#cbt-type").html(`${t.transaction_type}`)
            $("#cbt-des").html(`${t.description}`)
            $("#cbt-op").html(`${t.details.operating_system}`)
            $("#cbt-amount").html(`&#8358;${digify(t.amount, true)}`)
            $("#cbt-charges").html(`&#8358;${digify(t.details.charges, true)}`)
            $("#cbt-total").html(`&#8358;${digify(t.details.total_amount, true)}`)
            
            $(".trans-ref").val(JSON.stringify(d))

            $("#cbt-method").empty().append(`<option value="paystack">Paystack Payment Gateway</option>`);
            
            
            if(data.card) {
                $("#cbt-method").append(`<option value="card" selected>${data.card}</option>`);
              }
              if(data.wallet) {
                $("#cbt-method").append(`<option value="wallet" selected>Wallet Balance - &#8358;${digify(data.wallet, true)}</option>`);
              }
              
            $(".pay-cbt-con").addClass("active")
          }
          else {
              pushNotification("n_error", data.message, 5000)
          }
          hideLoader()
      },
      onError: (error) => {
          console.error(error);
          pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
          hideLoader()
      }
  })
}

function makePayment() {
    let data = $(".trans-ref").val();
    data = JSON.parse(data);
    //console.log(data)
    admin.product.makePayment({
      formData: data,
      onSuccess: (data) => {
        //console.log(data);
        verifyPayment(data.reference)
      },
      onError: (error) => {
        console.error(error);
        pushNotification("n_network", `Error occurred. ${error.message}`, 3000)
      }
    })
  }
  
  function autoPayment(method) {
    let data = $(".trans-ref").val();
    let obj = JSON.parse(data);
    let reference = obj.reference;
  
    let formData = {reference, method}
  
    showLoader("Making payment...");
  
    admin.product.autoPayment({
      formData: formData,
      onSuccess: (data) => {
        //console.log(data);
        if(data.status == "success") {
          if(method == "card") verifyPayment(data.reference);
          else if(method == "wallet") {
              pushNotification("n_success", data.message, -1);
              $(".pay-cbt-form")[0].reset()
              $(".pay-cbt-con").removeClass("active")
              getCBT();
              hideLoader()
          }
        }
        else {
          pushNotification("n_error", data.message, -1);
          hideLoader()
        }
        
      },
      onError: (error) => {
        console.error(error);
        hideLoader()
        pushNotification("n_network", `Error occurred. Kindly check your internet connection`, 3000)
      }
    })
  }
  
  
  function verifyPayment(reference) {
    showLoader("Verifying Payment...")
    admin.product.verifyPayment({
      params: {reference},
      onSuccess: (data) => {
        //console.log(data);
        if(data.status == "success") {
          pushNotification("n_success", `Transaction status: ${data.transaction_status}`, -1);
          $(".pay-cbt-form")[0].reset()
          $(".pay-cbt-con").removeClass("active")
          getCBT();
        }
        else {
          pushNotification("n_error", data.message, -1)
        }
        hideLoader()
      },
      onError: (error) => {
        console.error(error);
        hideLoader()
        pushNotification("n_network", `Error occurred. Kindly check your internet connection`, 3000)
      }
    })
  }


  $(".pay-cbt-form").on('submit', function(e) {
    e.preventDefault();
    let method = $("#cbt-method").val();
    if(method == "paystack") {
      makePayment()
    }
    else if(method == "card" || method == "wallet") {
      autoPayment(method)
    }
    else {
      pushNotification("n_error", "Kindly select a valid method of payment", 4000)
    }
    
  })

  
$(".lightbox-close").on('click', function() {$(".lightbox").removeClass("active")})
$(".update-config-form").submit(function(e) {e.preventDefault();updateConfig()})
$(".update-user-form").submit(function(e) {e.preventDefault();updateProfile()})
$(".change-pass-form").submit(function(e) {e.preventDefault();updatePassword()})
