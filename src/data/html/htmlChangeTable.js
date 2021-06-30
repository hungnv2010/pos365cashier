export default `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>POS365.VN</title>
    <style>
        table, th, td {
            border-collapse: collapse;
            border: none;
            font-size: 15px;
        }

        td {
            text-align: right;
            word-wrap: break-word;
            max-width: 0px;
        }
    </style>
</head>
<body>
    <table style="width:76mm; border: none;" rules=rows>
        <tr style="border-bottom:1px solid black;">
            <td style="text-align: center; border: none;"> <b> <span style="font-size:20px"> {Ten_Phong_Ban} </span> </b> </td>
        </tr>
        <tr> 
        <td style="text-align: left; border: none;"> <p> <b>Nhân viên</b>: {Nhan_Vien}<br> <b>Ngày</b>: {Gio_Hien_Tai}<br> </p> </td> </tr>
    </table>
    <table style="width:76mm; border: none;" rules=rows>
    <td style="text-align: center; border: none;"> <span > <b style="font-size:20px">{Noi_Dung_Phong_Ban}</b> </span> </td> </tr>
    </table>
</body>
</html>
`