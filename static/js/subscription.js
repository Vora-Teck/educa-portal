//DOM Elements
var circles = document.querySelectorAll(".circle"),
  progressBar = document.querySelector(".indicator"),
  buttons = document.querySelectorAll(".buttons button"),
  container = document.querySelector(".steps-con");

var currentStep = 1;

// function that updates the current step and updates the DOM
function updateSteps(e=null, steps=null) {
  // update current step based on the button clicked
  if(e) {
    currentStep = e.target.id === "next" ? ++currentStep : --currentStep;
  }
  if(steps) currentStep = parseInt(steps)
  
  // loop through all circles and add/remove "active" class based on their index and current step
  circles.forEach((circle, index) => {
    circle.classList[`${index < currentStep ? "add" : "remove"}`]("active");
  });

  // update progress bar width based on current step
  progressBar.style.width = `${((currentStep - 1) / (circles.length - 1)) * 100}%`;

  // check if current step is last step or first step and disable corresponding buttons
  if (currentStep === 1) {
    buttons[0].disabled = true;
  } else {
    buttons.forEach((button) => (button.disabled = false));
  }

  container.style.transform = `translateX(${(1- currentStep) * 25}%)`
};

updateSteps()

// add click event listeners to all buttons
buttons.forEach((button) => {
  button.addEventListener("click", updateSteps);
});


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

function getSubscriptions() {
    showLoader("Loading Subscription Plans...")
    $(".sub-wrapper").empty();
    let con_classes = ["basic", "premium", "ultimate"]
    admin.subscription.getSubscriptions({
        onSuccess: (data) => {
            //console.log(data);
            if(data.status == 'success') {
                let d = data.data;
                let cp = data.current_plan;
                for(let i in d) {
                    let temp = `
                    <div class="sub-table ${con_classes[i]}">
                    ${i == 1 ? `
                        <div class="ribbon"><span>Popular</span></div>` : ``}
                        
                        ${d[i].level == cp ? `<h3>Current Plan</h3>` : ``}
                        <div class="price-section">
                            <div class="price-area">
                            <div class="inner-area">
                                <span class="price">&#8358;${digify(d[i].monthly_price)}</span>
                                <span class="text">monthly</span>
                            </div>
                            </div>
                        </div>
                        <div class="package-name"></div>
                        <ul class="features">
                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>&nbsp;&nbsp;
                            ${d[i].features.join(`</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>
                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>&nbsp;&nbsp;`)}
                            </span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>
                            
                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>&nbsp;&nbsp;
                            ${d[i].max_staff == 0 ? `Unlimited` : `${digify(d[i].max_staff, false)}`} Staff Accounts</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>
                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>&nbsp;&nbsp;
                            ${d[i].max_students == 0 ? `Unlimited` : `${digify(d[i].max_students, false)}`} Students Accounts</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>
                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>&nbsp;&nbsp;
                            Credit Remove Permission</span>
                            <span class="icon cross"><i class="fa fa-times"></i></span>
                            </li>
                        </ul>
                        <div class="sub-btn" data-id="${d[i].id}">
                        <button>${d[i].level == cp ? `Renew Plan` : `Choose Plan`}</button>
                        </div>
                    </div>`
                    $(".sub-wrapper").append(temp)
                }
                $(".sub-btn").click(function() {
                  let id = $(this).data('id');
                  getPlan(id)
                    
                })
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

getCurrentPlan()
getSubscriptions()


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


$(".sub-price-btn").on('click', function() {
  let duration = $(this).data('id');
  let plan_id = $("#sub-plan-id").val();

  let formData = {duration, plan_id}
  //console.log(formData)

  showLoader("Initiating Payment...")

  admin.subscription.checkout({
    formData: formData,
      onSuccess: (data) => {
          //console.log(data);
          if(data.status == 'success') {
            let d = data.data;
            let t = data.transaction;

            $("#sp-plan").html(`${t.plan.title}`)
            $("#sp-duration").html(`${t.duration}`)
            $("#sp-amount").html(`&#8358;${digify(t.amount, true)}`)
            $("#sp-charges").html(`&#8358;${digify(t.details.charges, true)}`)
            $("#sp-total").html(`&#8358;${digify(t.details.total_amount, true)}`)
            $("#sp-start").html(`${datify(t.date)}`)
            $("#sp-end").html(`${datify(t.expiry_date)}`)
            $("#sp-email").html(`${d.email}`)
            $("#sub-pay-ref").val(JSON.stringify(d))
            
            updateSteps(null, 3)
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
})

$(".sub-pay-form").on('submit', function(e) {
  e.preventDefault();
  let data = $("#sub-pay-ref").val();
  data = JSON.parse(data);
  //console.log(data)
  admin.subscription.makePayment({
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
})

function verifyPayment(reference) {
  showLoader("Verifying Payment...")
  admin.subscription.verifyPayment({
    params: {reference},
    onSuccess: (data) => {
      //console.log(data);
      if(data.status == "success") {
        let obj = {
          success: "check", pending: "clock-o", failed: "times"
        }
        let obj2 = {
          success: "is successful!", pending: "is pending. You will be notified when the status changes.", failed: "has failed. Kindly try again."
        }
        let d = data.transaction_status;
        $(".sub-status-icon").addClass(d);
        $(".sub-status-con").html(`<i class="fa fa-${obj[d]}"></i>`)
        $(".sub-status-text").addClass(d).html(`Your transaction ${obj2[d]}`);
        updateSteps(null, 4)
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
