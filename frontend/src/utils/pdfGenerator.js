import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (title, data, columns, filename, type) => {
    try {
        // Create PDF document
        const doc = new jsPDF();

        // Function to add watermark
        const addWatermark = (doc) => {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.15 }));
            doc.setTextColor(44, 139, 163); // #2c8ba3
            doc.setFontSize(70);
            doc.setFont('helvetica', 'bold');
            doc.text('MedCare', 105, 220, { align: 'center', angle: 45 });
            doc.restoreGraphicsState();
        };

        // Add watermark to first page
        addWatermark(doc);

        // Add header
        doc.setFontSize(24);
        doc.setTextColor(44, 139, 163); // #2c8ba3
        doc.setFont('helvetica', 'bold');
        doc.text('MedCare', 105, 20, { align: 'center' });

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(44, 139, 163); // #2c8ba3
        doc.setFont('helvetica', 'normal');
        doc.text(title, 105, 30, { align: 'center' });

        // Add date
        doc.setFontSize(12);
        doc.setTextColor(44, 139, 163, 0.7); // #2c8ba3 with 70% opacity
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

        let startY = 50;

        // Common table styles
        const tableStyles = {
            theme: 'grid',
            headStyles: {
                fillColor: [44, 139, 163], // #2c8ba3
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                cellPadding: 1
            },
            styles: {
                fontSize: 9,
                cellPadding: 1,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
                lineColor: [44, 139, 163, 0.3], // #2c8ba3 with 30% opacity
                lineWidth: 0.1,
                textColor: [44, 139, 163, 0.8], // #2c8ba3 with 80% opacity
                fillColor: [255, 255, 255] // White background
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255] // White background for alternate rows
            },
            margin: { top: 3, right: 5, bottom: 5, left: 5 },
            tableWidth: 'auto',
            showFoot: 'lastPage',
            footStyles: {
                fillColor: [255, 255, 255], // White background
                textColor: [44, 139, 163, 0.8], // #2c8ba3 with 80% opacity
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 1
            }
        };

        // Handle different report types
        if (type === 'demographics' || type === 'activity') {
            data.forEach((section, index) => {
                if (index > 0) {
                    doc.addPage();
                    addWatermark(doc);
                    startY = 20;
                }

                // Add section title
                doc.setFontSize(11);
                doc.setTextColor(44, 139, 163); // #2c8ba3
                doc.setFont('helvetica', 'bold');
                doc.text(section.title, 105, startY, { align: 'center' });
                startY += 6;

                const tableData = section.data.map(item => 
                    section.columns.map(col => col.accessor(item))
                );

                autoTable(doc, {
                    ...tableStyles,
                    startY: startY,
                    head: [section.columns.map(col => col.header)],
                    body: tableData,
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 'auto' },
                        5: { cellWidth: 'auto' },
                        6: { cellWidth: 'auto' }
                    },
                    foot: [['Total Records: ' + section.data.length]]
                });

                startY = doc.lastAutoTable.finalY + 5;
            });
        } else {
            const tableData = data.map(item => columns.map(col => col.accessor(item)));

            // Create dynamic column styles based on number of columns
            const columnStyles = {};
            columns.forEach((_, index) => {
                columnStyles[index] = { cellWidth: 'auto' };
            });

            autoTable(doc, {
                ...tableStyles,
                startY: startY,
                head: [columns.map(col => col.header)],
                body: tableData,
                columnStyles: columnStyles,
                foot: [['Total Records: ' + data.length]]
            });
        }

        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(44, 139, 163, 0.7); // #2c8ba3 with 70% opacity
        doc.setFont('helvetica', 'normal');
        doc.text('© 2024 MedCare. All rights reserved.', 105, doc.internal.pageSize.height - 10, { align: 'center' });

        // Save the PDF
        doc.save(filename);

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};
