// let url = 'localhost:3333';
let url = 'chanle.ndtpro.xyz:3000';

const socket = io(url, {
    withCredentials: true
});

const urlParams = new URLSearchParams(window.location.search);

const _KEY = {
    VERIFY: 1,
    PUSH_TURN: 2,
    REFRESH: 3,
    PUSH: 4,
    USER_PUSH: 5,
};

let res_tb = $('#result-table');
let res = [];

let params_key = urlParams.get('key');
let server = urlParams.get('server');
let limit = 15;

var selection_server = 1;
var selection_rate = 0;
var turn_half_time = true;
var form_invalid = true;
var loading = false;

let turns = [];

updateUserMoney(user_data.money);
function updateUserMoney(money) {
    money = Number(money);
    if(jQuery.isEmptyObject(user_data)) return;
    user_data.money = money;
    $('span[data-so-du-user]').text(money.format());
}

$('#change-limit').val(limit);

$('#change-limit').on('change', (e) => {
    limit = e.target.value;
    updateData(true);
});

socket.on(_KEY.PUSH_TURN, (data) => {
    if(!params_key) {
        initServer(data.server);
        let turn = turns[data.server];
        turn.time = data.time;

        if(turn.key != data.key) {
            // is new turn
            turn.key = data.key;
            turn.instance.find('.turn_key').text(data.id);

            if(data.before_turn) {
                turn.instance.find('.turn_xu_win').text(Number(data.before_turn.res_xu_win).format());
                turn.instance.find('.turn_xu').text(Number(data.before_turn.res_xu).format());
                turn.instance.find('.turn_total').text((Number(data.before_turn.res_xu_win) + Number(data.before_turn.res_xu)).format());
                turn.instance.find('.turn_total_string').text(data.before_turn.result_string);

                let res = '';
                if(data.before_turn.res == 0) {
                    res = `<i class="fa fa-spinner fa-spin"></i>`;
                } else if(data.before_turn.res % 2 == 0) {
                    res = `<span class="label label-warning text-uppercase">chẵn</span>`;
                } else {
                    res = `<span class="label label-info text-uppercase">lẻ</span>`;
                }
                turn.instance.find('.turn_result_1').html(res);
                
                let x = "" + data.before_turn.res;
                let xx = x[x.length - 1] > 4 ? 3 : 4;
                if(data.before_turn.res == 0) {
                    res = `<i class="fa fa-spinner fa-spin"></i>`;
                } else if(xx == 3) {
                    res = `<span class="label label-success text-uppercase">tài</span>`;
                } else {
                    res = `<span class="label label-danger text-uppercase">xỉu</span>`;
                }
                turn.instance.find('.turn_result_2').html(res);
            }

            if(data.mini_result) {
                let m_r_1 = data.mini_result['chan_le'].map(res => {
                    if(res == 1) {
                        return `<span class="fa-stack">
                            <span class="fa fa-circle fa-stack-2x dot-text-le"></span>
                            <span class="fa-stack-1x text-white">L</span>
                        </span>`;
                    }
                    return `<span class="fa-stack">
                        <span class="fa fa-circle fa-stack-2x dot-text-chan"></span>
                        <span class="fa-stack-1x text-white">C</span>
                    </span>`;
                });

                let m_r_2 = data.mini_result['tai_xiu'].map(res => {
                    if(res == 3) {
                        return `<span class="fa-stack">
                            <span class="fa fa-circle fa-stack-2x dot-text-tai"></span>
                            <span class="fa-stack-1x text-white">T</span>
                        </span>`;
                    }
                    return `<span class="fa-stack">
                        <span class="fa fa-circle fa-stack-2x dot-text-xiu"></span>
                        <span class="fa-stack-1x text-white">X</span>
                    </span>`;
                });
                turn.instance.find('.mini_result_1').html(m_r_1.join(' '));
                turn.instance.find('.mini_result_2').html(m_r_2.join(' '));
            }

            if(data.server == selection_server) {
                updateData();
            }
        }
    }
});

socket.on(_KEY.REFRESH, (data) => {
    if(!params_key) {
        initServer(data.server);
        turns[data.server].time = data.time;
    }
});

socket.on(_KEY.PUSH, (data) => {
    if(!params_key && data.server == selection_server) {
        updateData();
    }
});

socket.on(_KEY.USER_PUSH, (data) => {
    if(!params_key) {
        updateData();
    }
});

function initServer(server) {
    if(turns[server] === undefined) {
        let turn = turns[server] = {};

        turn.server = server;
        turn.instance = getTurnServer(server);
        turn.time = 0;
        turn.key = turn.instance.find('.turn_key').text();

        turn.loop = setInterval(() => {
            if(turn.time > 0) {
                turn.time--;
                turn.instance.find('.turn_time').text(turn.time);
            }
            if(turn.server == selection_server) {
                if(turn.time <= 15) {
                    turn_half_time = true;
                } else {
                    turn_half_time = false;
                }
            }
        }, 1000);
    }
}

function getTurnServer(server) {
    return $(`.turn[turn-tab=${server}]`);
}

updateData();
function updateData(animation = false) {
    $.get('/get-players', {
        server: selection_server,
        key: params_key,
        limit: limit,
    }, (data, status) => {
        if(status !== 'success') {
            return;
        }

        res = data.players;
        if(data.user) {
            updateUserMoney(data.user.money);
        }

        updateResultTable();

        if(animation) {
            res_tb.removeClass('bounceIn animated').addClass('bounceIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('bounceIn animated');
            });
        }
    });
}

function updateResultTable() {
    if(res.length == 0) {
        res_tb.html(`<tr><td colspan="7" class="text-center">Chưa có người chơi</td></tr>`);
    } else {
        res_tb.html('');

        res.map(item => {

            switch (parseInt(item.selection)) {
                case 1:
                    item.selection = `<span class="label label-info text-uppercase">lẻ</span>`;
                    break;
                case 2:
                    item.selection = `<span class="label label-warning text-uppercase">chẵn</span>`;
                    break;
                case 3:
                    item.selection = `<span class="label label-success text-uppercase">tài</span>`;
                    break;
                case 4:
                    item.selection = `<span class="label label-danger text-uppercase">xỉu</span>`;
                    break;
            
                default:
                    item.status = loading_btn_primary;
                    break;
            }

            if(item.status != 0) {
                item.xu_win = Number(item.xu_win).format() + ' xu';
            } else {
                item.xu_win = loading_btn_primary;
            }

            switch (parseInt(item.status)) {
                case 1:
                    item.status = `<span class="label label-success text-uppercase">thắng</span>`;
                    break;
                case 2:
                    item.status = `<span class="label label-danger text-uppercase">thua</span>`;
                    break;
                case 3:
                    item.status = `<span class="label label-success text-uppercase">đã nhận thưởng</span>`;
                    break;
            
                default:
                    item.status = loading_btn_primary;
                    break;
            }

            // if(parseInt(item.res) === 0) {
            //     item.res = `<i class="fa fa-spinner fa-spin"></i>`;
            // } else if(parseInt(item.res) % 2 === 0) {
            //     item.res = `<span class="label label-warning text-uppercase">chẵn</span>`;
            // } else {
            //     item.res = `<span class="label label-info text-uppercase">lẻ</span>`;
            // }

            res_tb.append(`
            <tr>
                <td><span class="label label-warning">${item.server_name}</span></td>
                <td>${item.name}</td>
                <td>${Number(item.xu).format()} xu</td>
                <td>${item.selection}</td>
                <td>${item.status}</td>
                <td>${item.xu_win}</td>
                <td>${item.time}</td>
            </tr>
            `);
        });
    }
}

let money = 0;
let xu = 0;
let form = $('#form-chan-le');
let inp_money = form.find('input[name=money]');
let inp_xu = form.find('input[name=xu]');
let form_button = form.find('button');

inp_money.keyup(function(e) {
    updateChanLeMoneyValue();
});

inp_xu.keyup(function(e) {
    updateChanLeXuValue();
});

function updateChanLeMoneyValue() {
    if(jQuery.isEmptyObject(user_data)) return;

    money = +inp_money.val().replace(/\D/g,'');
    let i_xu = Math.round(money * selection_rate);
    updateChanLeValue(money, i_xu);
}

function updateChanLeXuValue() {
    xu = +inp_xu.val().replace(/\D/g,'');
    let i_money = Math.round(xu / selection_rate);
    updateChanLeValue(i_money, xu);
}

function updateChanLeValue(vmoney, vxu) {
    vmoney = Number(vmoney);
    vxu = Number(vxu);
    if(vmoney == 0) {
        inp_money.val('');
    } else {
        inp_money.val(Number(vmoney).format());
    }
    if(vxu == 0) {
        inp_xu.val('');
    } else {
        inp_xu.val(Number(vxu).format());
    }

    money = vmoney;
    xu = vxu;

    if(vmoney < 1000) {
        form_invalid = true;
    } else {
        form_invalid = false;
    }

    form_button.removeClass('rubberBand animated').addClass('rubberBand animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        $(this).removeClass('rubberBand animated');
    });
}

setInterval(() => {
    updateChanLeButton();
}, 100);

function updateChanLeButton() {
    if(jQuery.isEmptyObject(user_data)) {
        disabledFrom(true);
    }
    form_button.prop('disabled', turn_half_time || form_invalid || loading);
}

function clearForm() {
    inp_money.val('');
    inp_xu.val('');
    form_invalid = true;
}

function disabledFrom(type = true) {
    inp_money.prop('disabled', type);
    inp_xu.prop('disabled', type);
    loading = type;
}

form_button.click(function(e) {
    $(this).removeClass('bounceIn animated').addClass('bounceIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        $(this).removeClass('bounceIn animated');
    });
    let selection = $(this).attr('data-selection');

    let btn_text = $(this).html();
    $(this).html(loading_btn);
    disabledFrom(true);

    let rq = $.post('/push-chan-le', {
        _token: csrf_token,
        server: selection_server,
        money: money,
        selection: selection,
    });

    rq.done((data) => {
        if(data.status == 0) {
            let txt = '';
            for (let [key, value] of Object.entries(data.data)) {
                txt = value[0];
                if(key == 'outcoin') {
                    outcoin(txt);
                    return;
                }
                break;
            }
            Swal.fire(txt, '', 'error');
        } else {
            updateData();
            Swal.fire('Đặt cược thành công. Chờ kết quả nhé', '', 'success');
            updateUserMoney(data.data.money);
            socket.emit(_KEY.USER_PUSH, {});
            clearForm();
        }
    });

    rq.fail((data) => {
        Swal.fire('Có lỗi xảy ra', data, 'error');
        location.reload();
    });

    rq.always((data) => {
        $(this).html(btn_text);
        disabledFrom(false);
    });
});

function outcoin(txt) {
    Swal.fire({
        title: txt,
        text: "",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Có',
        confirmButtonClass: 'btn btn-success',
        cancelButtonText: 'Không',
        cancelButtonClass: 'btn btn-danger ml-1',
        buttonsStyling: false,
    }).then(function (result) {
        if (result.value) {
            location.replace('/nap-tien');
        }
    });
}