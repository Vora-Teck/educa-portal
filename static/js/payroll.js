/* =========== Transaction Section =============== */
showLoader("Loading data...")
var months = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}
function setYearMonth() {
    let today = new Date();
    let curr_year = today.getFullYear();
    let curr_month = today.getMonth() + 1;

    // clear year option
    $("#year-filter").empty()
    $("#month-filter").empty()

    for(let i = 2026; i <= curr_year; i++) {
        var temp = `<option value="${i}">${i}</option>`;
        $("#year-filter").prepend(temp)
    }
    for(let i in months) {
        var temp = `<option value="${i}">${months[i]}</option>`;
        $("#month-filter").append(temp)
    }
    $("#year-filter").val((curr_year).toString())
    $("#month-filter").val((curr_month).toString())
    getPayroll()
}
setYearMonth()

function getPayroll() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let month = $("#month-filter").val();
    let year = $("#year-filter").val();

    $('.pay-list').empty()
    loader = `<tr>
        <td colspan="5" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.pay-list').append(loader)

    let params = {page, pagesize, month, year}

    //console.log(params)

    admin.payroll.getPayroll({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.pay-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    //let count = data.total_count;
                    //$(".total_count").html(digify(count))
                    //$('.emp-no').html(data['total_items'])
                    $('#page_nos').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('#page_nos').append(temp);
                    }
                    let current_p = $('#page_nos .page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('#page_nos').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('#page_nos').append(next);
                    }
                    $('#page_nos .page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page').val(page);
                        getPayroll();
                    })
                    if(data.data) {
                        let e = data.data;

                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td class="w-bold-x">${e[i].staff.firstName} ${e[i].staff.middleName} ${e[i].staff.lastName}</td>
                            <td>${e[i].staff.staffId}</td>
                            <td>&#8358;${digify(e[i].amount)}</td>
                            <td class="w-center">
                            ${e[i].is_paid ? `
                                <span class="success-btn">Paid</span>`: `
                                <span class="danger-btn">Not Paid</span>`
                            }
                            </td>
                            <td class="w-text-gray">
                            ${e[i].is_paid ? `
                                <a class="t-det-link tooltipa" href="#" data-id='${e[i].id}'>
                                    <i class="fa fa-bank"></i>&nbsp;View Transaction
                                    <span class="tooltiptext w-card">View Transaction</span>
                                </a>`: `
                                
                                <a class="t-pay-link tooltipa" href="#" data-id='${e[i].id}'>
                                    <i class="fa fa-bank"></i>&nbsp;Make Payment
                                    <span class="tooltiptext w-card">Make Payment</span>
                                </a>`
                            }
                                
                                
                            </td>
                          </tr>`;
                          $('.pay-list').append(temp)
                        }
                        $('.t-det-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getTransaction(id)
                        })
                        $('.t-pay-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            initiatePayroll(id)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="5" class="w-text-gray w-italic">${data.message} for ${months[data.filters.month]} ${data.filters.year}.</td>
                        </tr>`;
                        $('.pay-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="5" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.pay-list').append(temp)
                }
                hideLoader()
        },
        onError: (error) => {
                console.error(error);
                $('.pay-list').empty()
                hideLoader()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

function generatePayroll() {
    let month = $("#month-filter").val();
    let year = $("#year-filter").val();

    let formData = {month, year};

    showLoader(`Generating Payroll for ${months[month]} ${year}`);
    //console.log(formData)
    admin.payroll.generatePayroll({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                getPayroll()
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            hideLoader()
        },
        onError: (error) => {
            //console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function initiatePayroll(payroll_id) {
    showLoader("Initiating transaction...")

    admin.payroll.initiateSinglePayment({
        formData: {payroll_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                let d = data.data;
                $(".pay-det-table").empty();
                
                $(".pay-amt").html(`&#8358;${digify(d.details.amount_payable, true)}`)
                $("#pay-reference").val(d.reference);

                let temp = `
                <tr>
                    <td>Transfer Amount</td>
                    <td>&#8358;${digify(d.amount, true)}</td>
                </tr>
                <tr>
                    <td>Service Charges</td>
                    <td>&#8358;${digify(d.details.transfer_charges)}</td>
                </tr>
                <tr>
                    <td>Description</td>
                    <td>${d.description}</td>
                </tr>
                <tr>
                    <td>Account Details</td>
                    <td>${d.details.destination_account_name} | ${d.details.destination_account_number}</td>
                </tr>
                <tr>
                    <td>Recipient Bank</td>
                    <td>${d.details.destination_bank_name}</td>
                </tr>
                <tr>
                    <td>Reference</td>
                    <td>${d.reference}</td>
                </tr>`;
                $(".pay-det-table").html(temp)

                $(".pay-trans-con").addClass("active")
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

function getTransaction(payroll_id) {
    showLoader("Loading data...")

    admin.payroll.getPayroll({
        params: {payroll_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;

                let stat_f = {
                    success: "success-btn", pending: "info-btn",
                    failed: "danger-btn", reversed: "warning-btn"
                }
                $(".trans-id").val(d.transaction.reference);
                $(".trans-staff").html(`${d.staff.firstName} ${d.staff.lastName}`)
                $(".trans-amt").html(`&#8358;${digify(d.amount, true)}`)
                $(".trans-stat").html(`<span class="${stat_f[d.transaction.status]}">${d.transaction.status}</span>`)
                $(".trans-type").html(d.transaction.transaction_type);
                $(".trans-des").html(d.transaction.description);
                $(".trans-ref").html(d.transaction.reference);
                $(".trans-date").html(datify(d.transaction.date, true));

                $(".trans-info-tab").empty();
                let det = d.transaction.details
                for(let i in det) {
                    let temp = `
                    <tr>
                        <td>${deslugify(i)}</td>
                        <td>${det[i]}</td>
                    </tr>`
                    $(".trans-info-tab").append(temp);
                }

                $(".view-trans-con").addClass("active")
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            hideLoader()
        },
        onError: (error) => {
            //console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function makePayment() {
    let reference = $("#pay-reference").val();
    let password = $("#pay-password").val();

    showLoader("Making payment...")

    admin.payroll.makeSinglePayment({
        formData: {reference, password},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".pay-det-table").empty();
                $(".pay-trans-con").removeClass("active")
                $(".pay-trans-form")[0].reset()
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

function generateReceipt(reference, type="transaction") {
    showLoader("Generating Receipt...")

    admin.transaction.generateReceipt({
        params: {reference, type},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                downloadFile(data.data)
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

/* =========== Bank Account Section =============== */
function getBanks() {
    $(".bank-filter").empty()
    admin.bank.list({
        onSuccess: (data) => {
            //console.log(data)
            for(let i in data) {
                let temp = `
                <option value="${data[i].bankCode}">${data[i].bankName}</option>`;
                $(".bank-filter").append(temp);
            }
            $(".bank-filter").prepend(`<option value="" selected>-- Select Bank --</option>`)
        },
        onError: (error) => {
            //console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function getStaff() {
    admin.staff.staffList({
        params: {page:1, pagesize:200},
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $(".staff-filter").empty()
                for(let i in d) {
                    let temp = `<option value="${d[i].id}">${d[i].firstName} ${d[i].lastName} (${d[i].qualification})</option>`;
                    $(".staff-filter").append(temp)
                }
                $(".staff-filter").prepend(`<option value="" selected>-- Select Staff --</option>`)
            },
            onError: (error) => console.error(error)
    })
}
getStaff()

function getBankAccounts() {
    let page = $('#emp_page2').val();
    let search = $('#emp_search2').val();
    let pagesize = 20;
    let status = $("#status-filter").val();

    $('.acc-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.acc-list').append(loader)

    let params = {page, pagesize, status, search}

    //console.log(params)

    admin.bank.bankAccounts({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.acc-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    //let count = data.total_count;
                    //$(".total_count").html(digify(count))
                    //$('.emp-no').html(data['total_items'])
                    $('#page_nos2').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('#page_nos2').append(temp);
                    }
                    let current_p = $('#page_nos2 .page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('#page_nos2').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('#page_nos').append(next);
                    }
                    $('#page_nos2 .page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page2').val(page);
                        getBankAccounts();
                    })
                    if(data.data) {
                        let e = data.data;

                        let stat = {pending: "info-btn", verified: "success-btn", rejected: "danger-btn"}

                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td class="w-bold-x">${e[i].staff.firstName} ${e[i].staff.middleName} ${e[i].staff.lastName}</td>
                            <td>${e[i].accountName}</td>
                            <td>${e[i].accountNumber}</td>
                            <td>${e[i].bank.bankName}</td>
                            <td class="w-center">
                            <span class="${stat[e[i].verification_status]}">${e[i].verification_status}</span>
                            </td>
                            <td>
                                <div class="dropdown">
                                    <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                    <div class="dropdown-menu">
                                        <!--
                                        <a class="dropdown-item b-det-link" data-id='${JSON.stringify(e[i])}' href="#">
                                            <i class="fa fa-edit"></i>&nbsp;
                                            Update Account
                                        </a>
                                        -->
                                        ${e[i].verification_status == "verified" ? `
                                            <a class="dropdown-item b-act-link" data-id="${e[i].id}" data-action="reject" href="#">
                                            <i class="fa fa-times-circle"></i>&nbsp;
                                            Mark As Rejected
                                            </a>` : `
                                            <a class="dropdown-item b-act-link" data-id="${e[i].id}" data-action="verify" href="#">
                                            <i class="fa fa-check-circle"></i>&nbsp;
                                            Mark As Verified
                                            </a>
                                        `}
                                    
                                    </div>
                                </div>
                                
                            </td>
                          </tr>`;
                          $('.acc-list').append(temp)
                        }
                        $('.b-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getAccount(obj)
                        })
                        $('.b-act-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            let action = $(this).data('action');
                            accountStatus(id, action)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data.message}.</td>
                        </tr>`;
                        $('.acc-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.acc-list').append(temp)
                }
                hideLoader()
        },
        onError: (error) => {
                console.error(error);
                $('.acc-list').empty()
                hideLoader()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getBanks()
getBankAccounts()

function debounce(func, delay) {
    let timeout;
    return(...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    }
}

var delayedSearch = debounce(getBankAccounts, 500)


function getAccount(obj) {
    //console.log(obj)
}

function verifyAccount() {
    let n = $('#acc-num').val()
    let c = $('#acc-bank').val();
    //let c = "001"

    if(n.length !== 10 || c.trim() === '') {
        $('#verify-name').html(``)
        $('#acc-name').val('')

        return
    }

    let params = {account_number: n, bank_code: c}
    $('#verify-name').html(`<div class="transfer-loader"></div>`)
    
    admin.bank.verifyAccount({
        params: params,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                $("#acc-name").val(data.data.account_name)
                pushNotification("n_success", "Account verified", 5000);
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            $('#verify-name').html(``)
            hideLoader()
        },
        onError: (error) => {
            //console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function addAccount() {
    let account_number = $('#acc-num').val();
    let bank_code = $('#acc-bank').val();
    //let bank_code = "001"
    let staff_id = $("#acc-staff").val();
    let account_name = $("#acc-name").val()

    if(staff_id.trim() === '') {
        pushNotification("n_error", "Kindly select a staff", 5000);
        return
    }

    if(account_number.length !== 10 || bank_code.trim() === '') {
        pushNotification("n_error", "Invalid bank account", 5000);
        return
    }

    if(account_name.trim() === '') {
        pushNotification("n_error", "Bank account has not been verified", 5000);
        return
    }
    

    let formData = {account_number, bank_code, staff_id}
    showLoader("Adding bank account...")
    admin.bank.addBankAccount({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                $(".add-bank-form")[0].reset()
                pushNotification("n_success", data.message, 5000);
                getBankAccounts()
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            hideLoader()
        },
        onError: (error) => {
            //console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function accountStatus(account_id, action) {

    let formData = {account_id, action}
    //console.log(formData)
    showLoader("Updating status...")
    admin.bank.verifyBankAccount({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                getBankAccounts()
            }
            else {
                pushNotification("n_error", data.message, 5000)
            }
            hideLoader()
        },
        onError: (error) => {
            //console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}


// ========== Event Listeners ======================
$(".gen-payroll-btn").click(function(e) {e.preventDefault();generatePayroll()})
$(".add-bank-btn").click(function(e) {e.preventDefault();$(".add-bank-con").addClass("active")})


$(".pay-trans-form").on('submit', function(e) {e.preventDefault();makePayment()})
$(".add-bank-form").on('submit', function(e) {e.preventDefault();addAccount()})
$(".view-trans-form").on('submit', function(e) {
    e.preventDefault();
    let ref = $(".trans-id").val();
    generateReceipt(ref)
})

$("#acc-num").on('input', function() {verifyAccount()})
$("#acc-bank").on('change', function() {verifyAccount()})

