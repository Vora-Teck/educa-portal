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
    let con_classes = {
      1: "basic", 2: "premium", 3: "ultimate", 10: "custom"
    }
    admin.subscription.getSubscriptions({
        onSuccess: (data) => {
            //console.log(data);
            if(data.status == 'success') {
                let d = data.data;
                let cp = data.current_plan;
                for(let i in d) {
                    let temp = `
                    <div class="sub-table ${con_classes[d[i].level]}">
                    ${i == 1 ? `
                        <div class="ribbon"><span>Popular</span></div>` : ``}
                        
                        ${d[i].id == cp ? `<h3>Current Plan</h3>` : ``}
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
                            <i class="fa fa-circle w-small w-text-blue"></i>
                            ${d[i].max_staff == 0 ? `Unlimited` : `${digify(d[i].max_staff, false)}`} Staff Accounts</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>
                            ${d[i].max_students == 0 ? `Unlimited` : `${digify(d[i].max_students, false)}`} Students Accounts</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>
                            ${digify(d[i].max_lesson_note_generated)} AI-Generated Lesson Notes / month</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                AI Analysis & Reports
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Unlimited AI-Generated Exam Questions
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            ${d[i].timetable_generation ? `
                              <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Free AI-Generated Timetables
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>` : ``}

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Dedicated School Email Account
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            ${d[i].student_ai_assistant ? `
                              <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Personalized AI Assistant for Students
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>` : ``}

                            ${d[i].sms_broadcast ? `
                              <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Free SMS Boradcast Messaging
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>` : ``}

                            ${d[i].features.map(function(item, index) {
                              return `
                              <li>
                                <span class="list-name">
                                <i class="fa fa-circle w-small w-text-blue"></i>
                                  ${item}
                                </span>
                                <span class="icon check"><i class="fa fa-check"></i></span>
                              </li>`
                            }).join('')}
                        </ul>
                        <div class="sub-btn" data-id="${d[i].id}">
                        <button>${d[i].id == cp ? `Renew Plan` : `Choose Plan`}</button>
                        </div>
                    </div>`
                    $(".sub-wrapper").append(temp)
                }
                let temp2 = `
                    <div class="sub-table custom">
                        
                        <div class="price-section">
                            <div class="price-area">
                            <div class="inner-area">
                                <span class="price">Custom Price</span>
                                <span class="text">monthly</span>
                            </div>
                            </div>
                        </div>
                        <div class="package-name"></div>
                        <ul class="features">

                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>
                            Custom Staff Accounts</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>
                            Custom Students Accounts</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                            <span class="list-name">
                            <i class="fa fa-circle w-small w-text-blue"></i>
                            Custom AI-Generated Lesson Notes / month</span>
                            <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                AI Analysis & Reports
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Unlimited AI-Generated Exam Questions
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                AI-Generated Timetables
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Dedicated School Email Account
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Personalized AI Assistant for Students
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                              <span class="list-name">
                              <i class="fa fa-circle w-small w-text-blue"></i>
                                Custom SMS Boradcast Messaging
                              </span>
                              <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>

                            <li>
                                <span class="list-name">
                                <i class="fa fa-circle w-small w-text-blue"></i>
                                  Online Fees Payment
                                </span>
                                <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>
                            <li>
                                <span class="list-name">
                                <i class="fa fa-circle w-small w-text-blue"></i>
                                  Automated Payroll System
                                </span>
                                <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>
                            <li>
                                <span class="list-name">
                                <i class="fa fa-circle w-small w-text-blue"></i>
                                  Dedicated Account Manager
                                </span>
                                <span class="icon check"><i class="fa fa-check"></i></span>
                            </li>
                        </ul>
                        <div class="sub-btn" data-id="0">
                        <button>Create Custom Plan</button>
                        </div>
                    </div>`
                $(".sub-wrapper").append(temp2)
                
                $(".sub-btn").click(function() {
                  let id = $(this).data('id');
                  if(id == "0") {
                    $(".create-plan-con").addClass("active")
                  }
                  else {
                    getPlan(id)
                  }
                })
                //initCarousel()
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

function initCarousel() {
  $(".sub-wrapper").owlCarousel({
    items: [1,1,1],
    loop: false,
    //autoplayTimeout: 5000,
    autoplay: false,
    //autoplayHoverPause: true,
    nav: true,   // no arrows
    dots: true,   // show dots
    navText: ['<', '>'],
    smartSpeed: 800,
    responsive: {
      0: {items: 1},
      768: {items: 1, margin: 10},
      1024: {items: 1, margin: 10}
    }
  });
}


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

            $("#sp-method").empty().append(`<option value="paystack">Paystack Payment Gateway</option>`);
            if(data.card) {
              $("#sp-method").append(`<option value="card" selected>${data.card}</option>`);
            }
            
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

function makePayment() {
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
}

function payWithCard() {
  let data = $("#sub-pay-ref").val();
  let obj = JSON.parse(data);
  let reference = obj.reference;

  let formData = {reference}

  showLoader("Making payment...");

  admin.subscription.payWithCard({
    formData: formData,
    onSuccess: (data) => {
      //console.log(data);
      if(data.status == "success") {
        verifyPayment(data.reference)
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

$(".sub-pay-form").on('submit', function(e) {
  e.preventDefault();
  let method = $("#sp-method").val();
  if(method == "paystack") {
    makePayment()
  }
  else if(method == "card") {
    payWithCard()
  }
  else {
    pushNotification("n_error", "Kindly select a valid method of payment", 4000)
  }
  
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

// =============== Custom Plan =========================
function calculatePrice() {
  const per_staff = 50, per_student = 20, per_note = 10,
  ai_ana = 1000, ai_assist = 1000, exam_gen = 1000, timetab = 500;

  let staff = $("#custom-staff").val();
  staff = parseInt(staff) * per_staff;
  
  let std = $("#custom-student").val();
  std = parseInt(std) * per_student;

  let note = $("#custom-note").val();
  note = parseInt(note) * per_note;

  let analysis = $("#custom-analytics").is(":checked") ? ai_ana : 0;
  let assistant = $("#custom-assistant").is(":checked") ? ai_assist : 0;
  let exam = $("#custom-exam").is(":checked") ? exam_gen : 0;
  let time = $("#custom-timetab").is(":checked") ? timetab : 0;

  let total_amount = staff + std + note + analysis + assistant + exam + time;
  $(".total-custom").html(digify(total_amount || 0, false))
}

calculatePrice()

function createPlan() {
  let staff_count = $("#custom-staff").val();
  let student_count = $("#custom-student").val();
  let note_count = $("#custom-note").val();
  let ai_analysis = $("#custom-analytics").is(":checked");
  let ai_assistant = $("#custom-assistant").is(":checked");
  let exam_generation = $("#custom-exam").is(":checked");
  let timetable_generation = $("#custom-timetab").is(":checked");

  let formData = {
    staff_count, student_count, note_count, ai_analysis,
    ai_assistant, exam_generation, timetable_generation
  }

  //console.log(formData)
  showLoader("Creating custom plan...");

  admin.subscription.createPlan({
    formData: formData,
    onSuccess: (data) => {
      //console.log(data);
      if(data.status == "success") {
        $(".create-plan-form")[0].reset();
        $(".create-plan-con").removeClass('active');
        pushNotification("n_success", data.message, 5000)
        getPlan(data.plan_id)
        getSubscriptions()
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


$(".create-plan-form input[type=number]").on('input', function() {calculatePrice()});
$(".create-plan-form input[type=checkbox]").on('change', function() {calculatePrice()});

$(".create-plan-form").on('submit', function(e) {e.preventDefault(); createPlan()})
