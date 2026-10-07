import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../models/models.dart';

/// Generates a branded product spec-sheet PDF identical to the website's jsPDF output.
/// Returns the raw PDF bytes so callers can share, print, or save however they like.
class PdfService {
  static const _burgundy = PdfColor.fromInt(0xFF64151B);
  static const _burgundyLight = PdfColor.fromInt(0xFFB4323C);
  static const _footerBg = PdfColor.fromInt(0xFFF8F3EF);
  static const _textDark = PdfColor.fromInt(0xFF191412);
  static const _textMuted = PdfColor.fromInt(0xFF5A504B);
  static const _borderColor = PdfColor.fromInt(0xFFC8B9AF);
  static const _zebraFill = PdfColor.fromInt(0xFFFCF8F5);
  static const _codeBg = PdfColor.fromInt(0xFFF5EBE4);
  static const _swatchBorder = PdfColor.fromInt(0xFFA0968C);
  static const _footerText = PdfColor.fromInt(0xFF645A55);

  /// Build the PDF and return bytes.
  static Future<Uint8List> generateProductPdf(Product product) async {
    final pdf = pw.Document(
      title: 'MATERIA – ${product.name.en}',
      author: 'MATERIA Premium Artificial Leather',
    );

    final name = product.name.en;
    final desc = product.description.en;

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: pw.EdgeInsets.zero,
        build: (context) {
          final pageW = PdfPageFormat.a4.width;
          final pageH = PdfPageFormat.a4.height;
          const ml = 15.0 * PdfPageFormat.mm;
          const mr = 15.0 * PdfPageFormat.mm;
          final bodyW = pageW - ml - mr;

          return pw.Stack(
            children: [
              // Main content column
              pw.Positioned.fill(
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    // ── HEADER BAR ──
                    _buildHeader(pageW, ml, mr),

                    // Thin accent line
                    pw.Container(width: pageW, height: 1 * PdfPageFormat.mm, color: _burgundyLight),

                    pw.SizedBox(height: 8 * PdfPageFormat.mm),

                    // ── PRODUCT IDENTITY ──
                    pw.Padding(
                      padding: pw.EdgeInsets.symmetric(horizontal: ml),
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          // Code badge
                          pw.Container(
                            padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: pw.BoxDecoration(
                              color: _codeBg,
                              borderRadius: pw.BorderRadius.circular(2),
                            ),
                            child: pw.Text(
                              product.code,
                              style: pw.TextStyle(
                                fontSize: 7,
                                fontWeight: pw.FontWeight.bold,
                                color: _burgundy,
                              ),
                            ),
                          ),
                          pw.SizedBox(height: 2 * PdfPageFormat.mm),

                          // Product name
                          pw.Text(
                            name,
                            style: pw.TextStyle(
                              fontSize: 13,
                              fontWeight: pw.FontWeight.bold,
                              color: _textDark,
                            ),
                          ),
                          if (desc.isNotEmpty) ...[
                            pw.SizedBox(height: 3 * PdfPageFormat.mm),
                            pw.Text(
                              desc.length > 300 ? '${desc.substring(0, 300)}...' : desc,
                              style: const pw.TextStyle(fontSize: 7.5, color: _textMuted),
                              maxLines: 4,
                            ),
                          ],
                        ],
                      ),
                    ),

                    pw.SizedBox(height: 8 * PdfPageFormat.mm),

                    // ── TECHNICAL SPECIFICATIONS ──
                    pw.Padding(
                      padding: pw.EdgeInsets.symmetric(horizontal: ml),
                      child: _buildSpecsSection(product, bodyW),
                    ),

                    pw.SizedBox(height: 10 * PdfPageFormat.mm),

                    // ── AVAILABLE COLORS ──
                    if (product.colors.isNotEmpty)
                      pw.Padding(
                        padding: pw.EdgeInsets.symmetric(horizontal: ml),
                        child: _buildColorsSection(product, bodyW),
                      ),

                    pw.Spacer(),
                  ],
                ),
              ),

              // ── FOOTER ──
              pw.Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: _buildFooter(pageW, pageH, ml, mr),
              ),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  // ─────────────────────────────────────────
  //  HEADER
  // ─────────────────────────────────────────
  static pw.Widget _buildHeader(double pageW, double ml, double mr) {
    return pw.Container(
      width: pageW,
      height: 24 * PdfPageFormat.mm,
      color: _burgundy,
      padding: pw.EdgeInsets.only(left: ml, right: mr),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        crossAxisAlignment: pw.CrossAxisAlignment.center,
        children: [
          // Left: Logo text
          pw.Column(
            mainAxisAlignment: pw.MainAxisAlignment.center,
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text(
                'MATERIA',
                style: pw.TextStyle(
                  fontSize: 14,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.white,
                ),
              ),
              pw.Text(
                'Premium Artificial Leather',
                style: const pw.TextStyle(fontSize: 7.5, color: PdfColor.fromInt(0xFFDCBEB4)),
              ),
            ],
          ),
          // Right: Contact info
          pw.Column(
            mainAxisAlignment: pw.MainAxisAlignment.center,
            crossAxisAlignment: pw.CrossAxisAlignment.end,
            children: [
              pw.Text(
                'www.materiaeg.com',
                style: const pw.TextStyle(fontSize: 7.5, color: PdfColor.fromInt(0xFFDCC8C3)),
              ),
              pw.Text(
                'info@materiaeg.com',
                style: const pw.TextStyle(fontSize: 7.5, color: PdfColor.fromInt(0xFFDCC8C3)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────
  //  SPECS TABLE
  // ─────────────────────────────────────────
  static pw.Widget _buildSpecsSection(Product product, double bodyW) {
    final rows = [
      ['Product Code', product.code],
      ['Thickness', product.thickness.isNotEmpty ? product.thickness : '—'],
      ['Width', product.width.isNotEmpty ? product.width : '—'],
      ['Length / Roll', '50 m'],
      ['Material Type', product.materialType.en.isNotEmpty ? product.materialType.en : '—'],
      ['Texture', product.texture.en.isNotEmpty ? product.texture.en : '—'],
      ['Backing', product.backing.en.isNotEmpty ? product.backing.en : '—'],
      ['Finish', product.finish.en.isNotEmpty ? product.finish.en : '—'],
      ['Water Resistance', product.waterResistance.en.isNotEmpty ? product.waterResistance.en : '—'],
      ['Softness Level', product.softnessLevel.en.isNotEmpty ? product.softnessLevel.en : '—'],
    ];

    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        _sectionHeading('Technical Specifications', bodyW),
        pw.SizedBox(height: 3 * PdfPageFormat.mm),
        pw.Container(
          decoration: pw.BoxDecoration(
            border: pw.Border.all(color: _borderColor, width: 0.4),
          ),
          child: pw.Column(
            children: rows.asMap().entries.map((entry) {
              final i = entry.key;
              final row = entry.value;
              return pw.Container(
                decoration: pw.BoxDecoration(
                  color: i % 2 == 0 ? _zebraFill : PdfColors.white,
                  border: i < rows.length - 1
                      ? const pw.Border(bottom: pw.BorderSide(color: PdfColor.fromInt(0xFFD2C3B9), width: 0.2))
                      : null,
                ),
                padding: const pw.EdgeInsets.symmetric(horizontal: 3 * PdfPageFormat.mm, vertical: 2.5 * PdfPageFormat.mm),
                child: pw.Row(
                  children: [
                    pw.SizedBox(
                      width: 55 * PdfPageFormat.mm,
                      child: pw.Text(
                        row[0],
                        style: pw.TextStyle(
                          fontSize: 7.8,
                          fontWeight: pw.FontWeight.bold,
                          color: const PdfColor.fromInt(0xFF463C37),
                        ),
                      ),
                    ),
                    pw.Container(width: 0.2, height: 4 * PdfPageFormat.mm, color: const PdfColor.fromInt(0xFFD2C3B9)),
                    pw.SizedBox(width: 2 * PdfPageFormat.mm),
                    pw.Expanded(
                      child: pw.Text(
                        row[1],
                        style: const pw.TextStyle(fontSize: 7.8, color: _textDark),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────
  //  COLORS SWATCHES
  // ─────────────────────────────────────────
  static pw.Widget _buildColorsSection(Product product, double bodyW) {
    const swatchSize = 10.0 * PdfPageFormat.mm;
    const gap = 4.0 * PdfPageFormat.mm;
    const labelH = 4.0 * PdfPageFormat.mm;
    const step = swatchSize + gap;

    final colorWidgets = product.colors.map((c) {
      final hex = c.hex.replaceAll('#', '');
      final r = int.parse(hex.substring(0, 2), radix: 16);
      final g = int.parse(hex.substring(2, 4), radix: 16);
      final b = int.parse(hex.substring(4, 6), radix: 16);

      return pw.SizedBox(
        width: step + 6 * PdfPageFormat.mm,
        child: pw.Column(
          children: [
            pw.Container(
              width: swatchSize,
              height: swatchSize,
              decoration: pw.BoxDecoration(
                color: PdfColor(r / 255, g / 255, b / 255),
                borderRadius: pw.BorderRadius.circular(1.5 * PdfPageFormat.mm),
                border: pw.Border.all(color: _swatchBorder, width: 0.3),
              ),
            ),
            pw.SizedBox(height: 1 * PdfPageFormat.mm),
            pw.Text(
              c.name.en.length > 18 ? c.name.en.substring(0, 18) : c.name.en,
              style: const pw.TextStyle(fontSize: 5.8, color: PdfColor.fromInt(0xFF41372E)),
              textAlign: pw.TextAlign.center,
              maxLines: 1,
            ),
          ],
        ),
      );
    }).toList();

    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        _sectionHeading('Available Colors', bodyW),
        pw.SizedBox(height: 3 * PdfPageFormat.mm),
        pw.Wrap(
          spacing: gap,
          runSpacing: gap + labelH,
          children: colorWidgets,
        ),
      ],
    );
  }

  // ─────────────────────────────────────────
  //  FOOTER
  // ─────────────────────────────────────────
  static pw.Widget _buildFooter(double pageW, double pageH, double ml, double mr) {
    return pw.Column(
      children: [
        pw.Container(
          width: pageW,
          height: 0.3,
          margin: pw.EdgeInsets.only(left: ml, right: mr),
          color: _borderColor,
        ),
        pw.Container(
          width: pageW,
          height: 15 * PdfPageFormat.mm,
          color: _footerBg,
          padding: pw.EdgeInsets.only(left: ml, right: mr),
          child: pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              pw.Text(
                'MATERIA Egypt',
                style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold, color: _burgundy),
              ),
              pw.Text(
                'Tel: 16870   |   info@materiaeg.com   |   www.materiaeg.com',
                style: const pw.TextStyle(fontSize: 7, color: _footerText),
              ),
              pw.Text(
                'Page 1 of 1',
                style: const pw.TextStyle(fontSize: 6.5, color: PdfColor.fromInt(0xFF968778)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────
  //  SECTION HEADING
  // ─────────────────────────────────────────
  static pw.Widget _sectionHeading(String text, double bodyW) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(
          text.toUpperCase(),
          style: pw.TextStyle(
            fontSize: 9,
            fontWeight: pw.FontWeight.bold,
            color: _burgundy,
          ),
        ),
        pw.SizedBox(height: 1.5 * PdfPageFormat.mm),
        pw.Container(
          width: bodyW,
          height: 0.5,
          color: _burgundy,
        ),
      ],
    );
  }
}
