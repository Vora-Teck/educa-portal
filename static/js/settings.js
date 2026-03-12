showLoader("Loading profile...")

function getProfile() {
  admin.account.getProfile({
          onSuccess: (data) => {
              //console.log(data)
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
          },
          onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
              hideLoader()
          }
  })
}

function schoolConfig() {
  admin.school.config({
          onSuccess: (data) => {
              //console.log(data)
              let d = data.data
              
              $("#config-renew").val(d.auto_renewal.toString());
              $("#config-payroll").val(d.auto_payroll.toString());
              $("#config-cbt").val(d.cbt_verification.toString());
              $("#config-date").val(d.payroll_date);
              $("#config-term").val(d.term_per_session);
              $("#config-week").val(d.weeks_per_term);
          },
          onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
              //hideLoader()
          }
  })
}

getProfile()
schoolConfig()

function updateProfile() {
  let phone_number = $("#p-phone").val();

  formData = {phone_number};
  
  showLoader("Updating profile...")

  admin.account.updateProfile({
      formData: formData,
      onSuccess: (data) => {
          if(data.status == 'success') {
              pushNotification("n_success", data.message, 5000)
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
      onSuccess: (data) => {
          if(data.status == 'success') {
              pushNotification("n_success", data.message, 5000)
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

$(".update-config-form").submit(function(e) {e.preventDefault();updateConfig()})
$(".update-user-form").submit(function(e) {e.preventDefault();updateProfile()})
$(".change-pass-form").submit(function(e) {e.preventDefault();updatePassword()})
