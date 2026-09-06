import ExcelJS from "exceljs";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { ensureDb, sql } from "../../../../../lib/db";

type Item = {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};

const safeCell = (value: unknown) => {
  const text = String(value ?? "");
  return /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
};

export async function GET() {
  if (!(await requireAdmin()))
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  await ensureDb();
  const orders =
    await sql()`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tiger Tech";
  const sheet = workbook.addWorksheet("Pedidos");
  sheet.columns = [
    { header: "Pedido", key: "id", width: 24 },
    { header: "Data", key: "date", width: 20 },
    { header: "Status", key: "status", width: 16 },
    { header: "Cliente", key: "customer", width: 25 },
    { header: "E-mail", key: "email", width: 28 },
    { header: "Telefone", key: "phone", width: 18 },
    { header: "CPF/CNPJ", key: "document", width: 18 },
    { header: "Endereço", key: "address", width: 35 },
    { header: "SKU", key: "sku", width: 18 },
    { header: "Produto", key: "product", width: 28 },
    { header: "Quantidade", key: "quantity", width: 12 },
    { header: "Valor unitário", key: "unitPrice", width: 16 },
    { header: "Subtotal", key: "subtotal", width: 16 },
    { header: "Total do pedido", key: "total", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF5A00" },
  };
  for (const order of orders) {
    const items = order.items as Item[];
    for (const item of items) {
      sheet.addRow({
        id: order.id,
        date: new Date(order.created_at),
        status: order.status,
        customer: safeCell(order.customer_name),
        email: safeCell(order.customer_email),
        phone: safeCell(order.customer_phone),
        document: safeCell(order.customer_document),
        address: safeCell(order.customer_address),
        sku: safeCell(item.sku),
        product: safeCell(item.name),
        quantity: item.quantity,
        unitPrice: item.unitPriceCents / 100,
        subtotal: item.subtotalCents / 100,
        total: Number(order.total_cents) / 100,
      });
    }
  }
  sheet.getColumn("date").numFmt = "dd/mm/yyyy hh:mm";
  for (const key of ["unitPrice", "subtotal", "total"])
    sheet.getColumn(key).numFmt = "R$ #,##0.00";
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: "N1" };
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pedidos-tiger-tech-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
