const stepInfo = document.getElementById("stepInfo");
const navLeftGroup = document.getElementById("navLeft");
const navRightGroup = document.getElementById("navRight");

// Section 1
const nameInput = document.getElementById("school_name");
const idNumInput = document.getElementById("year");
const emailInput = document.getElementById("school_email");
const mottoInput = document.getElementById("school_motto");
// Section 2
const addressInput = document.getElementById("school_address");
const countryInput = document.getElementById("country");
const stateInput = document.getElementById("state");
const lgaInput = document.getElementById("lga");
// Section 3
const sessionInput = document.getElementById("session");
const termInput = document.getElementById("term");
const startInput = document.getElementById("start_date");
const endInput = document.getElementById("end_date");
// Section 4
const fnameInput = document.getElementById("fname");
const lnameInput = document.getElementById("lname");
const phoneInput = document.getElementById("phone");
// Section 5
const userInput = document.getElementById("email");
const codeInput = document.getElementById("code");
const passInput = document.getElementById("password");
const termsCheckbox = document.getElementById("terms");

const circles = document.querySelectorAll(".circle");
const progressBar = document.querySelector(".indicator");


const form = document.getElementById("setupForm");
const formStepsID = ["one", "two", "three", "four", "five", "six"];
let currentFormStep = 0;
let formValues = null;



// function that updates the current step and updates the DOM
const updateSteps = () => {
  // loop through all circles and add/remove "active" class based on their index and current step
  circles.forEach((circle, index) => {
    circle.classList[`${index <= currentFormStep ? "add" : "remove"}`]("active");
  });

  // update progress bar width based on current step
  progressBar.style.width = `${(currentFormStep / (circles.length - 1)) * 100}%`;
};

const updateSummaryValues = () => {
        formValues = {
                name: nameInput.value,
                school_email: emailInput.value,
                year: idNumInput.value,
                motto: mottoInput.value,

                address: addressInput.value,
                country: countryInput.value,
                state: stateInput.value,
                lga: lgaInput.value,

                session: sessionInput.value,
                term: termInput.value,
                start_term: startInput.value,
                end_term: endInput.value,

                first_name: fnameInput.value,
                last_name: lnameInput.value,
                phone_number: phoneInput.value,

                email: userInput.value,
                code: codeInput.value,
                password: passInput.value,
        }

        $("#name-val").text(formValues.name);
        $("#email-val").text(formValues.school_email);
        $("#motto-val").text(formValues.motto);
        $("#year-val").text(formValues.year);

        $("#address-val").text(formValues.address);
        $("#country-val").text(formValues.country);
        $("#state-val").text(formValues.state);
        $("#lga-val").text(formValues.lga);

        $("#fname-val").text(`${formValues.first_name} ${formValues.last_name}`);
        $("#phone-val").text(formValues.phone_number);
        $("#user-val").text(formValues.email);
};

const updateStepVisibility = () => {
        formStepsID.forEach((step) => {
                document.getElementById(step).style.display = "none";
        });

        document.getElementById(formStepsID[currentFormStep]).style.display = "block";

        stepInfo.textContent = `Step ${currentFormStep + 1} of ${formStepsID.length}`;

        if (currentFormStep === 5) {
                updateSummaryValues();
        }

        navLeftGroup.style.display = currentFormStep === 0 ? "none" : "flex";
        navRightGroup.style.display = currentFormStep === formStepsID.length - 1 ? "none" : "flex";

        const currentStep = document.getElementById(formStepsID[currentFormStep]);
        const firstInput = currentStep.querySelector("input, select, textarea");
        if (firstInput) {
                firstInput.focus();
        }
};

const showError = (input, message) => {
        const formControl = input.parentElement;
        const errorSpan = formControl.querySelector(".error-message");
        input.classList.add("error");
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", errorSpan.id);
        errorSpan.textContent = message;
};

const clearError = (input) => {
        const formControl = input.parentElement;
        const errorSpan = formControl.querySelector(".error-message");
        input.classList.remove("error");
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
        errorSpan.textContent = "";
};

const validateStep = (currentStep) => {
        let isValid = true;

        if (currentStep === 0) {
                if (nameInput.value.trim() === "") {
                        showError(nameInput, "School name is required");
                        isValid = false;
                }
                if (idNumInput.value.trim() === "") {
                        showError(idNumInput, "Established year is required");
                        isValid = false;
                }
                if (emailInput.value.trim() === "" || !emailInput.validity.valid) {
                        showError(emailInput, "A valid email is required");
                        isValid = false;
                }
                
        } 
        else if (currentStep === 1) {
                if (addressInput.value.trim() === "") {
                        showError(addressInput, "School address is required");
                        isValid = false;
                }
                if (countryInput.value === "") {
                        showError(countryInput, "Country is required");
                        isValid = false;
                }
                if (stateInput.value === "") {
                        showError(stateInput, "State selection is required");
                        isValid = false;
                }
                if (lgaInput.value === "") {
                        showError(lgaInput, "LGA selection is required");
                        isValid = false;
                }
        } 
        else if (currentStep === 2) {
                if (!isValidSession(sessionInput.value)) {
                        showError(sessionInput, "Invalid session format. should be YYYY-YYYY (start year - end year)");
                        isValid = false;
                }
                if (termInput.value.trim() === "") {
                        showError(termInput, "Kindly select current term");
                        isValid = false;
                }
                if (!startInput.value || startInput.value.trim() === "") {
                        showError(startInput, "Current term start date is required");
                        isValid = false;
                }
                if (!endInput.value || endInput.value.trim() === "") {
                        showError(endInput, "Current term end date is required");
                        isValid = false;
                }
        }
        else if (currentStep === 3) {
                if (fnameInput.value.trim() === "") {
                        showError(fnameInput, "First Name is required");
                        isValid = false;
                }
                if (lnameInput.value.trim() === "") {
                        showError(lnameInput, "Last Name is required");
                        isValid = false;
                }
                if (phoneInput.value.trim() === "") {
                        showError(phoneInput, "Phone number is required");
                        isValid = false;
                }
        }
        else if (currentStep === 4) {
                if (userInput.value.trim() === "" || !userInput.validity.valid) {
                        showError(userInput, "A valid email is required");
                        isValid = false;
                }
                if (codeInput.value.trim() === "") {
                        showError(codeInput, "OTP code is required");
                        isValid = false;
                }
                if (passInput.value === "" || !passInput.validity.valid) {
                        showError(passInput, "Password must be at lease 8 characters long with numbers and letters");
                        isValid = false;
                }
                if (!termsCheckbox.checked) {
                        showError(termsCheckbox, "Terms and conditions must be accepted");
                        isValid = false;
                }
        }

        return isValid;
};

const realtimeValidation = () => {
        nameInput.addEventListener("input", () => {
                if (nameInput.value.trim() !== "") clearError(nameInput);
        });

        idNumInput.addEventListener("input", () => {
                if (idNumInput.value.trim() !== "") clearError(idNumInput);
        });

        emailInput.addEventListener("input", () => {
                if (emailInput.value.trim() !== "") clearError(emailInput);
        });

        addressInput.addEventListener("input", () => {
                if (addressInput.value.trim() !== "") clearError(addressInput);
        });

        stateInput.addEventListener("change", () => {
                if (stateInput.value.trim() !== "") {
                        clearError(stateInput);
                        getLgas(stateInput.value)
                };
        });

        lgaInput.addEventListener("change", () => {
                if (lgaInput.value !== "") clearError(lgaInput);
        });

        fnameInput.addEventListener("input", () => {
                if (fnameInput.value.trim() !== "") clearError(fnameInput);
        });

        sessionInput.addEventListener("input", () => {
                if (sessionInput.value.trim() !== "") clearError(sessionInput);
        });

        termInput.addEventListener("change", () => {
                if (termInput.value.trim() !== "") clearError(termInput);
        });

        startInput.addEventListener("change", () => {
                if (startInput.value) clearError(startInput);
        });

        endInput.addEventListener("change", () => {
                if (endInput.value) clearError(endInput);
        });

        lnameInput.addEventListener("input", () => {
                if (lnameInput.value.trim() !== "") clearError(lnameInput);
        });

        phoneInput.addEventListener("input", () => {
                if (phoneInput.value.trim() !== "") clearError(phoneInput);
        });

        userInput.addEventListener("input", () => {
                if (userInput.value.trim() !== "") clearError(userInput);
        });

        codeInput.addEventListener("input", () => {
                if (codeInput.value.trim() !== "") clearError(codeInput);
        });

        passInput.addEventListener("input", () => {
                if (passInput.value.trim() !== "") clearError(passInput);
        });

        termsCheckbox.addEventListener("change", () => {
                if (termsCheckbox.checked) clearError(termsCheckbox);
        });
};

function isValidSession(a) {
        let value = a.trim();
        let pattern = /^(20\d{2}|2100)-(20\d{2}|2100)$/;
        if(pattern.test(value)) {
                //let [start, end] = value.split("-").map(Number);
                return true;
        }
        return false
}

const getStates = () => {
        admin.misc.getStates({
                onSuccess: (data) => {
                        $("#state").empty().append(`<option value="" selected>Select State</option>`)
                        for(let i=0; i < data.length; i++) {
                                let temp = `<option value="${data[i]}">${data[i]}</option>`;
                                $("#state").append(temp)
                        }
                },
                onError: (error) => console.error(error)
        })
}

const getLgas = (state = "Abia") => {
        admin.misc.getLgas({
                params: { state },
                onSuccess: (data) => {
                        $("#lga").empty().append(`<option value="" selected>Select LGA</option>`)
                        for(let i=0; i < data.length; i++) {
                                let temp = `<option value="${data[i]}">${data[i]}</option>`;
                                $("#lga").append(temp)
                        }
                },
                onError: (error) => console.error(error)
        })
}

        navLeftGroup.style.display = "none";
        updateStepVisibility();
        getStates()
        
        realtimeValidation();

        navRightGroup.addEventListener("click", () => {
                if (currentFormStep < formStepsID.length - 1) {
                        if (validateStep(currentFormStep)) {
                                currentFormStep++;
                                updateStepVisibility();
                                updateSteps()
                        }
                }
        });

        navLeftGroup.addEventListener("click", () => {
                if (currentFormStep > 0) {
                        currentFormStep--;
                        updateStepVisibility();
                        updateSteps()
                }
        });

const checkSchoolName = () => {
        let sch_name = $("#school_name").val();
        $("#verify-name").empty()
        if(sch_name.trim() == "") {
                pushNotification("n_warning", "Kindly enter a name", 3000)
                return;
        }
        $("#verify-btn").html(`<i class="fa fa-repeat rotate"></i> Verify`).attr('disabled', true)
        admin.school.checkAvailability({
                params: {name: sch_name},
                onSuccess: (data) => {
                        //console.log(data)
                        if(data.status == 'success') {
                                if(data.available === true) {
                                        $("#verify-name").html(`<span class="w-text-green"><i class="fa fa-check-circle"></i> '${sch_name}' is available for use.</span>`)
                                }
                                else {
                                        $("#verify-name").html(`<span class="w-text-red"><i class="fa fa-times-circle"></i> '${sch_name}' is not available for use.</span>`)
                                }
                        }
                        else {
                                pushNotification("n_error", data.message, 3000)
                        }
                        $("#verify-btn").html(`<i class="fa fa-repeat"></i> Verify`).attr('disabled', false)
                },
                onError: (error) => {
                        $("#verify-btn").html(`<i class="fa fa-repeat"></i> Verify`).attr('disabled', false)
                        console.error(error)
                        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                }
              })
}

const getOTP = () => {
        let email = $("#email").val();
        $("#verify-code").empty()

        if(email.trim() == "") {
                pushNotification("n_warning", "Kindly enter a valid email", 3000)
                return;
        }
        $("#otp-btn").html(`<i class="fa fa-repeat rotate"></i> Get Code`).attr('disabled', true)
        admin.school.requestOTP({
                formData: {email},
                onSuccess: (data) => {
                        //console.log(data)
                        if(data.status == 'success') {
                                pushNotification("n_success", data.message, 3000)
                                $("#verify-code").html(`<span class="w-text-green"><i class="fa fa-check-circle"></i> ${data.message}</span>`)
                        }
                        else {
                                pushNotification("n_error", data.message, 3000)
                        }
                        $("#otp-btn").html(`<i class="fa fa-repeat"></i> Get Code`).attr('disabled', false)
                },
                onError: (error) => {
                        $("#otp-btn").html(`<i class="fa fa-repeat"></i> Get Code`).attr('disabled', false)
                        console.error(error)
                        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                }
              })
}


document.querySelector("#pass-btn").addEventListener('click', function(e) {
        e.preventDefault();
        if(passInput.type == "password") {
                passInput.type = "text"
                this.innerHTML = `<i class="fa fa-eye-slash"></i>`
        }
        else {
                passInput.type = "password";
                this.innerHTML = `<i class="fa fa-eye"></i>`
        }
})


$("#setupForm").on("submit", (e) => {
        e.preventDefault();
        showLoader("Setting up Account...")
        admin.school.setup({
                formData: formValues,
                onSuccess: (data) => {
                        //console.log(data)
                        if(data.status == 'success') {
                                pushNotification("n_success", data.message, 3000)
                                $("#setupForm")[0].reset()
                                currentFormStep = 0;
                                updateStepVisibility();
                                setTimeout(function() {
                                        location.href = '/login';
                                }, 1500)
                        }
                        else {
                                pushNotification("n_error", data.message, 3000)
                        }
                        hideLoader()
                },
                onError: (error) => {
                        hideLoader()
                        console.error(error)
                        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                }
        })
        
});





