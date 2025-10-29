
function authenticate() {
    let email = $('#email').val();
    let password = $('#password').val();

    if(!email || !password) {
        pushNotification("n_error", "Username or password cannot be empty", 3000);
        return
    }
    const formData = {email, password}
    showLoader("Authenticating...")

    admin.account.login({
        formData: formData,
        onSuccess: (data) => {
                console.log(data);
                if(data.status == 'success') {
                        pushNotification("n_success", data.message, 3000)
                        location.href = '/'
                }
                else {
                        pushNotification("n_error", data.message, 3000)
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


$('.login-form').submit(function(e) {
    e.preventDefault();
    authenticate();
})


function logout() {
        showLoader("Logging out...")

    admin.account.logout({
        onSuccess: (data) => {
                console.log(data);
                if(data.status == 'success') {
                        pushNotification("n_success", data.message, 3000)
                        location.href = '/login/'
                }
                else {
                        pushNotification("n_error", data.message, 3000)
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

