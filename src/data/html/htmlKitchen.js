export default `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Document</title>
    <style>
      table, th, td {
        border-collapse: collapse;
        border: none;
        font-size:15px;
      }
      td {
        text-align: right;
        word-wrap: break-word;
        max-width: 0px;
      }
      body { margin:0 auto; background-color: white;}
    </style>
  </head>
  <body>
    <table style="width:76mm;  margin:0 auto;  border: none;" rules=rows>
      <tr>
        <td style="text-align: center; border: none;">
          <b>
            <span style="font-size:20px">
              {Ten_Phong_Ban}
            </span>
          </b>
        </td>
      </tr>
      <tr>
        <td  style="text-align: left; border: none;">
          <p>
            <b>Nhân viên</b>: {Nhan_Vien}<br>
            <b>Ngày</b>: {Gio_Hien_Tai}<br>
          </p>
        </td>
      </tr>
    </table>
    <table style="width:76mm; margin:0 auto; border: none;" rules=rows>
      <tr style="border-top:1px dashed black;border-bottom:1px dashed black;height:25px;" >
    <th style="text-align: left">Tên hàng</th>
    <th width="50">SL</th>
    </tr>
    <!--Body Table-->
    <tr  style="border-top:1px dashed black;border-bottom:1px dashed black;height:25px;">
          <td style="text-align: left; {So_Luong_Check}"><b>{STT_Hang_Hoa}. {Ten_Hang_Hoa}</b><i>{Ghi_Chu_Hang_Hoa}</i></td>
           <td style="vertical-align:top;">{So_Luong} {DVT_Hang_Hoa}</td>
          </tr>
          </tr>
     <!--Body Table-->
    </table>
    <table style="width:76mm; border: none;" rules=rows>
      <tr>
    <td style="text-align: center; border: none;">
      <b>
        <p>... [{STT_Don_Hang}]<span {Lien_check}> - [{Lien}]</span>...</p>
      </b>
    </td>
</tr>
    </table>
    <br>
    <br>
  </body>
</html>
`