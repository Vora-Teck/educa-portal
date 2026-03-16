
function authenticate() {
    let email = $('#email').val();
    let password = $('#password').val();

    if(!email || !password) {
        pushNotification("n_error", "Email or password cannot be empty", 3000);
        return
    }
    const formData = {email, password}

    localStorage.removeItem("educa_school_info");
    localStorage.removeItem("educa_user_info");
    
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

function resetPassword() {
        let email = $('#forg-email').val();
    
        if(!email) {
            pushNotification("n_error", "Email cannot be empty", 3000);
            return
        }
        const formData = {email}
        showLoader("Processing...")
    
        admin.account.forgotPassword({
            formData: formData,
            onSuccess: (data) => {
                    console.log(data);
                    if(data.status == 'success') {
                            pushNotification("n_success", data.message, -1)
                            location.href = '#'
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


$('#login-form').submit(function(e) {
    e.preventDefault();
    authenticate();
})

$('#forgot-form').submit(function(e) {
        e.preventDefault();
        resetPassword();
    })


function logout() {
        showLoader("Logging out...")

    admin.account.logout({
        onSuccess: (data) => {
                console.log(data);
                if(data.status == 'success') {
                        pushNotification("n_success", data.message, 3000)
                        localStorage.removeItem("educa_school_info");
                        localStorage.removeItem("educa_user_info");
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


$("#pass-btn").on('click', function(e) {
        e.preventDefault();
        var passInput = $("#password");
        if(passInput.attr('type') == "password") {
                passInput.attr('type', 'text')
                $(this).html(`<i class="fa fa-eye-slash"></i>`)
        }
        else {
                passInput.attr('type', 'password')
                $(this).html(`<i class="fa fa-eye"></i>`)
        }
})

