/* =========== Ticket Section =============== */
async function getData() {

    showLoader("Loading Data...")

    try {
        let data = await cache.fetchOrCache({
        func: "admin.school.schoolData",
        params: {page: "ticket"}, fetcher: admin.school.schoolData
        })

        if(data.status == 'success') {
                    let d = data.data;
                    $(".all-count").html(digify(d.all, false))
                    $(".res-count").html(digify(d.resolved, false))
                    $(".pro-count").html(digify(d.in_progress, false))
                    $(".sub-count").html(digify(d.submitted, false))
                    $(".can-count").html(digify(d.cancelled, false))
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                }
                hideLoader()
    }
    catch(error) {
        console.error(error);
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}
getData()

async function getTickets() {
    let page = $('#emp_page').val();
    let pagesize = 10;
    let search = $('#emp_search').val();
    let status = $("#status-filter").val()

    $('.ticket-list').empty()
    loader = `<tr>
        <td colspan="5" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.ticket-list').append(loader)

    let params = {page, pagesize, search, status}

    try {
        let data = await cache.fetchOrCache({
        func: "admin.ticket.ticketList",
        params, fetcher: admin.ticket.ticketList,
        ttl: 20 * 60 * 60
        })

        $('.ticket-list').empty()
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
                        getTickets();
                    })
                    if(data.data) {
                        let e = data.data;
                        let stat = {
                            "resolved": "success-btn", "cancelled": "danger-btn",
                            "submitted": "info-btn", "in_progress": "warning-btn",
                            "closed": "danger-btn"
                        }
                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">#${e[i].ticket_id}</div>
                            </td>
                            <td style="max-width:300px;white-space:wrap;">${e[i].subject}</td>
                            <td class="w-center"><span class="${stat[e[i].status]}">${capitalize(e[i].status.split('_').join(' '))}</span></td>
                            <td>${datify(e[i].date, true)}</td>
                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item ev-det-link" data-id='${e[i].id}' href="#">
                                                <i class="fa fa-eye"></i>&nbsp;View Details
                                            </a>
                                            ${e[i].status == "submitted" ? `
                                                <a class="dropdown-item w-text-red w-hover-red ev-del-link" data-id='${e[i].id}' href="#">
                                                    <i class="fa fa-times-circle"></i>&nbsp;Cancel Ticket
                                                </a>` : ``}
                                                                                 
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.ticket-list').append(temp)
                        }
                        $('.ev-del-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getTicket(obj, "cancel")
                        })
                        $('.ev-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getTicket(obj, "view")
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="5" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.ticket-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="5" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.ticket-list').append(temp)
                }
    }
    catch(error) {
        console.error(error);
        $('.ticket-list').empty()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}
getTickets()

function debounce(func, delay) {
    let timeout;
    return(...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    }
}

var delayedSearch = debounce(getTickets, 500)


function addTicket() {
    let subject = $("#ticket-subject").val();
    let category = $("#ticket-category").val();
    let description = tinymce.get('ticket-message').getContent({format: 'html'})
    let file = $("#ticket-file")[0].files[0];

    let formData = new FormData();
    formData.append("subject", subject);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('file', file)

    //console.log(formData)

    showLoader("Submitting Complaint...")

    admin.ticket.createTicket({
        formData: formData,
        onSuccess: async (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-ticket-form")[0].reset();
                $(".add-ticket-con").removeClass('active')

                cache.clearFunction("admin.ticket.ticketList")
                await cache.refresh("admin.school.schoolData", {page: "ticket"}, admin.school.schoolData)
                
                getData()
                getTickets()
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

async function getTicket(ticket_id, action) {
    showLoader("Getting details...")
    try {
        let data = await cache.fetchOrCache({
        func: "admin.ticket.ticketList",
        params: {ticket_id}, fetcher: admin.ticket.ticketList,
        ttl: 20 * 60 * 60
        })

        $(".view-ticket-area").empty()
                if(data.status == 'success') {
                    let e = data.data;
                    let a = e.files;
                    $(".tick-name").html(`Ticket ID: #${e.ticket_id}`)
                    if(action == "view") {
                        let attachments = ``;
                        if(a.length > 0) {
                            for(let i in a) {
                                var temp = `
                                <a class="w-text-white" href="${a[i].file}" target="_blank" download>
                                    <button class="transp-btn">
                                        ${a[i].file_name}&nbsp;&nbsp;
                                        <i class="fa fa-download"></i>
                                    </button>
                                </a>`;
                                attachments += temp
                            }
                        }
                        var temp = `
                        <div class="table-responsive">
                        <table class="table">
                            <tbody>
                            <tr>
                                <td>Category</td>
                                <td>${capitalize(e.category)}</td>
                            </tr>
                            <tr>
                                <td>Date</td>
                                <td>${datify(e.date, true)}</td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                        <h4>${e.subject}</h4>
                        <div class="email-body mt-3">
                        ${e.description}
                        </div>
                        <div class="email-attachments mt-3">
                            ${attachments}
                        </div>`;

                        $(".view-ticket-area").append(temp)
                    }
                    else if(action == "cancel") {
                        $(".ticket-id").val(e.id)
                    }
                    $(`.${action}-ticket-con`).addClass("active")
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    
                }
                hideLoader()
    }
    catch(error) {
        console.error(error);
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
    
}

function cancelTicket() {
    let ticket_id = $(".ticket-id").val();

    let formData = {ticket_id}

    showLoader("Cancelling ticket...")

    admin.ticket.cancelTicket({
        formData: formData,
        onSuccess: async (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".cancel-ticket-form")[0].reset();
                $(".cancel-ticket-con").removeClass('active')

                cache.clearFunction("admin.ticket.ticketList")
                await cache.refresh("admin.school.schoolData", {page: "ticket"}, admin.school.schoolData)

                getTickets()
                getData()
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
initiateTiny(true)

/* =========== Eduka Guide Section =============== */
async function getSections() {
    try {
        let data = await cache.fetchOrCache({
        func: "admin.site.guideSections",
        fetcher: admin.site.guideSections
        })

        $("#section-filter").empty().append(`<option value="" selected>Select Section/Page</option>`)
                if(data.status == 'success') {
                    let d = data.data;
                    for(let i in d) {
                        let temp = `
                        <option value="${d[i].slug}">${d[i].title}</option>`;
                        $("#section-filter").append(temp)
                    }
                    
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                }
    }
    catch(error) {
        console.error(error);
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}
getSections()

async function getGuides() {
    let section = $('#section-filter').val();

    if(!section || section.trim() == "") {
        pushNotification('n_warning', "Kindly select a section/page", 5000);
        return;
    }

    $('.guide-list').empty()
    $(".g-vid").empty()

    let params = {section}

    //console.log(params)
    showLoader("Loading...")

    try {
        let data = await cache.fetchOrCache({
        func: "admin.site.guideContents",
        params, fetcher: admin.site.guideContents
        })

        if(data.status == 'success') {
                let e = data.data;
                $(".g-tit").html(data.section)
                $(".g-des").html(data.description || "No description provided")
                if(data.video_id) {
                    $(".g-vid").html(`
                    <iframe class="g-video"
                    src="https://youtube.com/embed/${data.video_id}?cc_load_policy=1" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    frameborder="0" id="demo-con" allowfullscreen></iframe>
                    `)
                }
                if(e.length > 0) {
                    for(var i in e) {
                        let temp = `
                        <div class="card mb-2">
                            <div class="card-header">
                                <a class="card-link w-flex w-flex-between" data-toggle="collapse" href="#collapse_${i}">
                                <span>${parseInt(i) + 1}. ${e[i].title}</span>
                                <div class="fa fa-chevron-down"></div>
                                </a>
                            </div>
                            <div id="collapse_${i}" class="collapse" data-parent="#accordion">
                                <div class="w-padding">
                                    <div class="mt-3 w-padding">
                                        ${e[i].content}
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>`;
                        $('.guide-list').append(temp)
                    }
                }
                else {
                    let temp = `
                    <p class="w-text-gray"><i>No guide found for this section.</i></p>`;
                    $('.guide-list').append(temp)
                }
            }
            else {
                pushNotification("n_error", data.message, 3000);
            }
            hideLoader()
    }
    catch(error) {
        console.error(error);
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}

/*

*/

// ============== AI Agent Section =========================
function setup_agent() {
    let eleven_ai = $("#elevenlabs_ai");

    let info = localStorage.getItem("educa_user_info");
    let user_name = "";
    if(info) {
      info = JSON.parse(info);
      user_name = info.full_name
    }
    else {user_name = "there"}
    //console.log(eleven_ai.attr('agent-id'))
    let ai_data = {
        user_name: "there",
    }
    
    eleven_ai.attr('dynamic-variables', JSON.stringify(ai_data))
}
setup_agent()

// ========== Event Listeners ======================
$(".add-ticket-btn").click(function(e) {e.preventDefault();$(".add-ticket-con").addClass('active')})

$("#section-filter").on('change', function() {getGuides()})

$(".add-ticket-form").on('submit', function(e) {e.preventDefault();addTicket()})
$(".cancel-ticket-form").on('submit', function(e) {e.preventDefault();cancelTicket()})

