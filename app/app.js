/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//const SV_IP   = 'boardgame.rp.lfx.sony.co.jp'; // node.js server の IP アドレス
//const SV_IP   = '52.194.10.158';          // node.js server の IP アドレス
const SV_IP   = '192.168.91.143';           // node.js server の IP アドレス
const SV_PORT = 4002;                       // node.js server の port 番号

let server = io.connect('http://' + SV_IP + ':' + SV_PORT);


//-----------------------------------------------------------------------------
//-------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function() {
  console.log("[app.js] window.onloaded");

  console.log("[app.js] server.emit(" + 'C_to_S_INIT' + ")");
  server.emit('C_to_S_INIT');
};


window.onunload = function() {
  console.log("[app.js] window.onunloaded");
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on('connect', function() {               // 接続時
  console.log("[app.js] " + 'connected');
});


server.on('disconnect', function(client) {      // 切断時
  console.log("[app.js] " + 'disconnected');
});


server.on('S_to_C_DATA', function(data) {
  console.log("[app.js] " + 'S_to_C_DATA');
  console.log("[app.js] data = " + data.value);
//  window.alert('コマンドを送信しました。\n\r' + data.value);
});


server.on('S_to_C_INIT_DONE', function(data) {
  console.log("[app.js] " + 'S_to_C_INIT_DONE');
//  console.log("[app.js] data.one  = " + JSON.stringify(data.one));
//  console.log("[app.js] data.many = " + JSON.stringify(data.many));

  let options = {
    layout:         'fitColumns',
    tooltips:       true,
    addRowPos:      'top',
    history:        true,
    pagination:     'local',
    paginationSize: 1000,
    movableColumns: true,
    initialSort:[
      {column:'title', dir:'asc'},
    ],
    rowFormatter: function(row) {
      //row - row component
      let data = row.getData();

      if(data.gid != "") {
        row.getElement().css({'background-color': '#424242'});
        row.getElement().css({'color': '#f5f5f5'});
      }
//        row.getElement().addClass("table-bordered");
    },
    columns:[
      {title:'状態',         field:'status',            align:'center', width:70,  sortable:'true', sorter:'boolean', formatter:'tickCross', editable:true,                                                   cellClick:function(e, cell){updateTable()}, },
      {title:'Global ID',    field:'gid',               align:'left',   width:100, sortable:'true', sorter:'number',  formatter:'plaintext',                 editor:'input', cssClass:'tabulator-background', cellClick:function(e, cell){console.log("cell click : gid")}, },
      {title:'email',        field:'email',             align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext',                 editor:'input', cssClass:'tabulator-background', cellClick:function(e, cell){console.log("cell click : email")}, },
      {title:'推薦コメント', field:'comment_recommend', align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext', editable:true,  },
      {title:'貸し出し日',   field:'date',              align:'center', width:110, sortable:'true', sorter:'date',    formatter:'plaintext', editable:false,                                                  cellClick:function(e, cell){console.log("cell click : date")}, },
      {title:'返却期限',     field:'deadline',          align:'center', width:100, sortable:'true', sorter:'date',    formatter:'plaintext', editable:false,                                                  cellClick:function(e, cell){console.log("cell click : deadline")}, },
      {title:'残日数',       field:'progress',          align:'left',   width:80,                   sorter:'number',  formatter:'progress',  },
      {title:'Rating',       field:'rating',            align:'center', width:120,                                    formatter:'star',      editable:true,  editor:true, formatterParams:{stars:6}, cellEdited:function(e, cell){updateTable()}, },
      {title:'貸出回数',     field:'count',             align:'left',   width:120,                  sorter:'number',  formatter:'progress',  },
      {title:'タイトル',     field:'title',             align:'left',   width:400, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'url',          field:'url',               align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'価格',         field:'price',             align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'プレイ人数',   field:'players',           align:'left',   width:100, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'コメント',      field:'comment',           align:'left',   width:150, sortable:'true', sorter:'number',  formatter:'plaintext', editable:false, },
      {title:'入庫日',       field:'arrival_date',      align:'left',   width:100, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
    ],
  };

  // 一冊のみの本のテーブル
  $('#tabulator-table-one').tabulator(options);
  $('#tabulator-table-one').tabulator('setData', data.one);

  // 複数冊ある本のテーブル
  $('#tabulator-table-many').tabulator(options);
  $('#tabulator-table-many').tabulator('setData', data.many);

});


server.on('S_to_C_UPDATE_DONE', function(data) {
  console.log("[app.js] " + 'S_to_C_UPDATE_DONE');
  console.log("[app.js] data.ret   = " + data.ret);
//  console.log("[app.js] data.one  = " + JSON.stringify(data.one));
//  console.log("[app.js] data.many = " + JSON.stringify(data.many));

  if(data.ret == false) {
    alert('この書籍は持ち出し禁止です。');
  }

  $('#tabulator-table-one').tabulator('setData', data.one);
  $('#tabulator-table-many').tabulator('setData', data.many);
});


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * テーブルのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * updateTable();
*/
function updateTable() {
  console.log("[app.js] updateTable()");

  let one  = $('#tabulator-table-one').tabulator('getData');
  let many = $('#tabulator-table-many').tabulator('getData');

  console.log("[app.js] server.emit(" + 'C_to_S_UPDATE' + ")");
  server.emit('C_to_S_UPDATE', {one: one, many: many});

}


