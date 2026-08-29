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


async function getPayroll() {
    let page = $('#emp_page').val();
    let pagesize = 30;
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

    try {
        let data = await cache.fetchOrCache({
        func: "admin.payroll.getPayroll",
        params, fetcher: admin.payroll.getPayroll
        })

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
                            <td style="max-width:30px !important;">
                                <label class="checkbox-con">
                                    <input type="checkbox" name="pay_ids" value="${e[i].id}" data-id='${JSON.stringify(e[i])}'>
                                    <span class="checkmark"></span>
                                </label>
                            </td>
                            <td class="w-bold-x">${e[i].staff.firstName} ${e[i].staff.middleName} ${e[i].staff.lastName}</td>
                            <td>${e[i].staff.staffId}</td>
                            <td>&#8358;${digify(e[i].amount)}</td>
                            <td class="w-center">
                            ${e[i].is_paid ? `
                                <span class="success-btn">Paid</span>`: `
                                <span class="danger-btn">Not Paid</span>`
                            }
                            </td>
                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                        <div class="dropdown-header">${e[i].staff.firstName} ${e[i].staff.middleName} ${e[i].staff.lastName}</div>
                                            ${e[i].is_paid ? `
                                                <a class="dropdown-item t-det-link" data-id='${e[i].id}' href="#">
                                                <i class="fa fa-file-text"></i>&nbsp;View Transaction
                                                </a>` : `
                                                <a class="dropdown-item t-pay-link" data-id='${e[i].id}' data-name="${e[i].staff.firstName} ${e[i].staff.middleName} ${e[i].staff.lastName}" href="#">
                                                <i class="fa fa-dollar"></i>&nbsp;Make Payment
                                            </a>  `}
                                                                          
                                        </div>
                                    </div>
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
                            let tit = $(this).data('name');
                            $("#payroll-id").val(id);
                            $(".sal-tit").html(`${months[month]} ${year} Salary for ${tit}`)
                            $(".add-tax-con").addClass("active")
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
    }
    catch(error) {
        console.error(error);
        $('.pay-list').empty()
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }

}

function generatePayroll() {
    let month = $("#month-filter").val();
    let year = $("#year-filter").val();

    let formData = {month, year};

    showLoader(`Generating Payroll for ${months[month]} ${year}`);
    //console.log(formData)
    admin.payroll.generatePayroll({
        formData: formData,
        onSuccess: async (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                
                let page = $('#emp_page').val();
                let pagesize = 30;
                await cache.refresh("admin.payroll.getPayroll", {page, pagesize, month, year}, admin.payroll.getPayroll)

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

function initiatePayroll() {
    let payroll_id = $("#payroll-id").val();
    let deductions = {};
    let increments = {};

    $(".e-breakdown-key").each(function() {
        var value = $(this).val();
        if(value.trim() !== "") {
            deductions[value] = $(this).siblings(".e-breakdown-value").val();
        }
    })

    $(".e-breakdown-key2").each(function() {
        var value = $(this).val();
        if(value.trim() !== "") {
            increments[value] = $(this).siblings(".e-breakdown-value2").val();
        }
    })

    if(!payroll_id || payroll_id.trim() == "") {
        pushNotification("n_warning", "No payroll selected!", 5000);
        return;
    }

    let formData = {payroll_id, deductions, increments}

    showLoader("Initiating transaction...")

    admin.payroll.initiateSinglePayment({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-tax-form")[0].reset();
                $(".add-tax-con").removeClass("active")
                let d = data.data;
                $(".pay-det-table").empty();
                
                $(".pay-amt").html(`&#8358;${digify(d.details.amount_payable, true)}`)
                $("#pay-reference").val(d.reference);

                let temp = `
                <tr>
                    <td>Salary Amount</td>
                    <td>&#8358;${digify(d.details.salary, true)}</td>
                </tr>
                <tr>
                    <td>Transfer Amount</td>
                    <td>&#8358;${digify(d.amount, true)}</td>
                </tr>
                <tr>
                    <td>Service Charges</td>
                    <td>&#8358;${digify(d.details.transfer_charges)}</td>
                </tr>
                <tr>
                    <td>Electronic Levy</td>
                    <td>&#8358;${digify(d.details.electronic_levy)}</td>
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

function initiateBulkPayroll() {
    let payroll_ids = $("input[name='pay_ids']:checked").map(function() {
        return $(this).val();
    }).get();

    if(payroll_ids.length == 0) {
        pushNotification("n_warning", "No payroll selected", 5000);
        return;
    }

    $(".pays-con").empty();
    $(".errors-con").empty();
    $(".warnings-con").empty();
    $(".balances-con").empty();
    $("#pays-reference").val("")

    showLoader("Initiating transaction...")

    admin.payroll.initiateBulkPayment({
        formData: {payroll_ids},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                let e = data.data;
                let refs = data.references;
                let balance = data.wallet_balance;
                let total_cost = data.total_cost;
                let errors = data.errors;
                let warnings = data.warnings;

                $("#wall-bal").html(`&#8358;${digify(balance, true)}`);
                $("#total-pay").html(`&#8358;${digify(total_cost, true)}`);


                if(errors.length > 0) {
                    errors.map((item, index) => {
                        $(".errors-con").append(`
                            <div class="alert alert-danger alert-dismissible fade show">
                                <button type="button" class="close" data-dismiss="alert">&times;</button>
                                <i class="w-large fa fa-times-circle"></i> ${item}
                            </div>
                        `)
                    })
                }
                if(warnings.length > 0) {
                    warnings.map((item, index) => {
                        $(".errors-con").append(`
                            <div class="alert alert-warning alert-dismissible fade show">
                                <button type="button" class="close" data-dismiss="alert">&times;</button>
                                <i class="w-large fa fa-warning"></i> ${item}
                            </div>
                        `)
                    })
                }
                
                $("#pays-reference").val(refs.join(";"));

                for(let i in e) {
                    let temp = `
                    <div class="card">
                        <div class="card-header">
                            <a class="card-link w-flex w-flex-between" data-toggle="collapse" href="#collapse_${i}">
                            <span>${e[i].description} - &#8358;${digify(e[i].amount, true)}</span>
                            <div class="fa fa-chevron-down"></div>
                            </a>
                        </div>
                        <div id="collapse_${i}" class="collapse" data-parent="#accordion">
                            <div class="w-padding">
                                <div class="w-center mt-3 mb-3">
                                    <div class="h2 trans-amt w-bold-xx">&#8358;${digify(e[i].details.amount_payable, true)}</div>
                                </div>
                                <div class="table-responsive">
                                    <table class="table">
                                        <tbody class="trans-det-table">
                                        <tr>
                                            <td>Transfer Amount</td>
                                            <td>&#8358;${digify(e[i].amount, true)}</td>
                                        </tr>
                                        <tr>
                                            <td>Service Charges</td>
                                            <td>&#8358;${digify(e[i].details.transfer_charges)}</td>
                                        </tr>
                                        <tr>
                                            <td>Electronic Levy</td>
                                            <td>&#8358;${digify(e[i].details.electronic_levy)}</td>
                                        </tr>
                                        <tr>
                                            <td>Description</td>
                                            <td>${e[i].description}</td>
                                        </tr>
                                        <tr>
                                            <td>Account Details</td>
                                            <td>${e[i].details.destination_account_name} | ${e[i].details.destination_account_number}</td>
                                        </tr>
                                        <tr>
                                            <td>Recipient Bank</td>
                                            <td>${e[i].details.destination_bank_name}</td>
                                        </tr>
                                        <tr>
                                            <td>Reference</td>
                                            <td>${e[i].reference}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>`;
                    $(".pays-con").append(temp)
                }
                
                let is_wallet_valid = Number(balance) >= Number(total_cost);
                let is_trans_available = e.length > 0;
                if(is_wallet_valid && is_trans_available) {
                    $(".pays-btn").attr('disabled', false)
                }
                else {
                    $(".pays-btn").attr('disabled', true)
                }
                if(!is_wallet_valid) {
                    $(".balances-con").append(`
                        <div class="alert alert-warning fade show">
                            <i class="w-large fa fa-warning"></i> You do not have sufficient wallet balance to complete this transaction.
                        </div>
                    `)
                }
                if(!is_trans_available) {
                    $(".balances-con").append(`
                        <div class="alert alert-warning fade show">
                            <i class="w-large fa fa-warning"></i> No transaction available for processing.
                        </div>
                    `)
                }
                $(".pays-trans-con").addClass("active")
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

async function getTransaction(payroll_id) {
    showLoader("Loading data...")

    try {
        let data = await cache.fetchOrCache({
        func: "admin.payroll.getPayroll",
        params: {payroll_id}, fetcher: admin.payroll.getPayroll
        })

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
    }
    catch(error) {
        console.error(error);
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
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
                cache.clearFunction("admin.payroll.getPayroll")
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

function makeBulkPayment() {
    let references = $("#pays-reference").val();
    let password = $("#pays-password").val();

    references = references.trim().split(";")

    showLoader("Making payment...")

    admin.payroll.makeBulkPayment({
        formData: {references, password},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".pays-con").empty();
                $(".pays-trans-con").removeClass("active")
                $(".pays-trans-form")[0].reset()
                cache.clearFunction("admin.payroll.getPayroll")
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

$('#add-breakdown-btn').click(function(e) {
    e.preventDefault();
    var temp = `
    <div class="w-flex w-flex-start mb-2 w-align-center" style="gap:15px">
      <input type="text" class="e-breakdown-key" placeholder="e.g Loan">
      <div>:</div>
      <input type="number" class="e-breakdown-value" placeholder="e.g &#8358;5,000">
      <div class="fa fa-times w-text-red h3 rem-breakdown-btn"></div>
    </div>`;
    $(".breakdown-con").append(temp)
    $(".rem-breakdown-btn").click(function() {
      $(this).parent(".w-flex").remove();
    })
});

$('#add-breakdown-btn2').click(function(e) {
    e.preventDefault();
    var temp = `
    <div class="w-flex w-flex-start mb-2 w-align-center" style="gap:15px">
      <input type="text" class="e-breakdown-key2" placeholder="e.g Bonus">
      <div>:</div>
      <input type="number" class="e-breakdown-value2" placeholder="e.g &#8358;5,000">
      <div class="fa fa-times w-text-red h3 rem-breakdown-btn2"></div>
    </div>`;
    $(".breakdown-con2").append(temp)
    $(".rem-breakdown-btn2").click(function() {
      $(this).parent(".w-flex").remove();
    })
});


function deletePayroll() {
    $(".delete-pay-form")[0].reset();
    $(".del-pay-list").empty()

    let payroll_ids = $("input[name='pay_ids']:checked").map(function() {
        return $(this).val();
    }).get();

    if(payroll_ids.length == 0) {
        pushNotification("n_warning", "No payroll selected", 5000);
        return;
    }

    let payroll_objs = $("input[name='pay_ids']:checked").map(function() {
        return $(this).data('id');
    }).get();

    //console.log(payroll_ids, payroll_objs)
    $(".pay-ids").val(payroll_ids.join(";"))

    for(i in payroll_objs) {
        let d = payroll_objs[i];

        let temp = `
        <li>${months[d.month]} ${d.year} Salary for ${d.staff.firstName} ${d.staff.middleName} ${d.staff.lastName} (${d.is_paid ? `Paid: will not be deleted` : `Unpaid`})</li>`

        $(".del-pay-list").append(temp);
    }
    
    $(".delete-pay-con").addClass("active")
}


function deletePayrolls() {

    let payroll_ids = $(".pay-ids").val().trim().split(";");
    let password = $("#pay-delete-password").val();
  
    let formData = {payroll_ids, password}
  
    showLoader("Deleting Payroll...")
    
    admin.payroll.deletePayroll({
      formData: formData,
      onSuccess: async (data) => {
          //console.log(data)
          if(data.status == "success") {
              pushNotification("n_success", data.message, 5000);
              $(".delete-pay-form")[0].reset();
              $(".delete-pay-con").removeClass("active")

              let page = $('#emp_page').val();
                let pagesize = 30;
                let month = $("#month-filter").val();
                let year = $("#year-filter").val();
              await cache.refresh("admin.payroll.getPayroll", {page, pagesize, month, year}, admin.payroll.getPayroll)

              getPayroll();
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

/* =========== Bank Account Section =============== */
async function getBanks() {
    $(".bank-filter").empty()
    try {
        let data = await cache.fetchOrCache({
        func: "admin.bank.list",
        fetcher: admin.bank.list
        })

        for(let i in data) {
                let temp = `
                <option value="${data[i].bankCode}">${data[i].bankName}</option>`;
                $(".bank-filter").append(temp);
            }
            $(".bank-filter").prepend(`<option value="" selected>-- Select Bank --</option>`)
    }
    catch(error) {
        console.error(error);
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}

async function getStaff() {
    try {
        let data = await cache.fetchOrCache({
        func: "admin.staff.staffList",
        params: {page:1, pagesize:300}, fetcher: admin.staff.staffList
        })

        let d = data.data
                $(".staff-filter").empty()
                for(let i in d) {
                    let temp = `<option value="${d[i].id}">${d[i].firstName} ${d[i].lastName} (${d[i].qualification})</option>`;
                    $(".staff-filter").append(temp)
                }
                $(".staff-filter").prepend(`<option value="" selected>-- Select Staff --</option>`)
    }
    catch(error) {
        console.error(error);
    }
}
getStaff()

async function getBankAccounts() {
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

    try {
        let data = await cache.fetchOrCache({
        func: "admin.bank.bankAccounts",
        params, fetcher: admin.bank.bankAccounts
        })

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
    }
    catch(error) {
        console.error(error);
        $('.acc-list').empty()
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
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
        onSuccess: async (data) => {
            //console.log(data)
            if(data.status == "success") {
                $(".add-bank-form")[0].reset()
                pushNotification("n_success", data.message, 5000);
                cache.clearFunction("admin.bank.bankAccounts")
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
        onSuccess: async (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                
                let page = $('#emp_page2').val();
                let search = $('#emp_search2').val();
                let pagesize = 20;
                let status = $("#status-filter").val();
                await cache.refresh("admin.bank.bankAccounts", {page, pagesize, status, search}, admin.bank.bankAccounts)
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

$(".add-tax-form").on('submit', function(e) {e.preventDefault();initiatePayroll()})
$(".pay-trans-form").on('submit', function(e) {e.preventDefault();makePayment()})
$(".pays-trans-form").on('submit', function(e) {e.preventDefault();makeBulkPayment()})
$(".add-bank-form").on('submit', function(e) {e.preventDefault();addAccount()})
$(".view-trans-form").on('submit', function(e) {
    e.preventDefault();
    let ref = $(".trans-id").val();
    generateReceipt(ref)
})
$(".delete-pay-form").on('submit', function(e) {e.preventDefault();deletePayrolls()})


$(".all_pays").on("change", function() {
    let is_checked = $(this).is(":checked")
    $("input[name='pay_ids']").each((index, item) => {
        $(item).prop('checked', is_checked)
    })
})

$(".payroll-act-form").on('submit', function(e) {
    e.preventDefault();
    let action = $("#payroll-action").val().trim();
    if(action == "") {
        pushNotification("n_warning", "No action selected!", 5000)
        return;
    }
    switch(action) {
        case "pay":
            initiateBulkPayroll();
            break;
        case "delete":
            deletePayroll();
            break;
        default:
            break;
    }
})

$("#acc-num").on('input', function() {verifyAccount()})
$("#acc-bank").on('change', function() {verifyAccount()})

