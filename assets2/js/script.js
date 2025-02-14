Number.prototype.format = function(n, x) {
    var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
};

const csrf_token = $("meta[name='_token']").attr("content");
let ud = $("meta[name='user_data']").attr("content");
var user_data = ud ? JSON.parse(ud) : {};

const loading_btn = `<div class="lds-facebook"><div></div><div></div><div></div></div>`;
const loading_btn_primary = `<div class="lds-facebook lds-primary"><div></div><div></div><div></div></div>`;

$("a[href=#ctsd]").click((e) => {
    e.preventDefault();

    $.get('/finance/get-so-du', {}, (data, status) => {
        if(status !== 'success') {
            return;
        }
        let tb = $("#modelWallet table tbody");
        tb.html("");

        data.map(item => {
            tb.append(`
            <tr>
                <td style="text-align: left;"><b>${item.server}:</b></td>
                <td><span class="label label-danger">${Number(item.money).format()} xu</span></td>
            </tr>
            `);
        });
    
        $("#modelWallet").modal("show");
    });
});