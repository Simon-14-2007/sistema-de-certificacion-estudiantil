document.addEventListener('DOMContentLoaded', function() {
    // 1. Configuración inicial
    const currentDateElement = document.getElementById('currentDate');
    const today = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    currentDateElement.textContent = today.toLocaleDateString('es-ES', options);
    
    // 2. Elementos del DOM
    const studentNameInput = document.getElementById('studentName');
    const documentNumberInput = document.getElementById('documentNumber');
    const signatureImageInput = document.getElementById('signatureImage');
    const signaturePreview = document.getElementById('signaturePreview');
    const generateBtn = document.getElementById('generateBtn');
    const previewName = document.getElementById('previewName');
    const previewDocument = document.getElementById('previewDocument');
    const previewSignature = document.getElementById('previewSignature');

    // 3. Actualización en tiempo real del certificado
    studentNameInput.addEventListener('input', function() {
        previewName.textContent = this.value || 'NOMBRE DEL ESTUDIANTE';
    });
    
    documentNumberInput.addEventListener('input', function() {
        previewDocument.textContent = this.value || 'NÚMERO DE DOCUMENTO';
    });

    // 4. Manejo de la imagen de firma
    signatureImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Por favor seleccione un archivo de imagen (JPEG, PNG)');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(event) {
            signaturePreview.innerHTML = `
                <img src="${event.target.result}" alt="Firma cargada">
                <button class="remove-signature" onclick="removeSignature()" title="Eliminar firma">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Mostrar firma en el certificado
            const signatureContainer = document.querySelector('.signature-image-container');
            signatureContainer.innerHTML = `<img src="${event.target.result}" alt="Firma">`;
            previewSignature.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    });

    // 5. Función para eliminar firma
    window.removeSignature = function() {
        signaturePreview.innerHTML = '';
        signatureImageInput.value = '';
        document.querySelector('.signature-image-container').innerHTML = '';
        previewSignature.style.display = 'none';
    };

    // 6. Generación de PDF 
    generateBtn.addEventListener('click', async function() {
        // Validación
        if (!studentNameInput.value.trim()) {
            alert('Por favor ingrese el nombre del estudiante');
            return;
        }
        
        if (!documentNumberInput.value.trim()) {
            alert('Por favor ingrese el número de documento');
            return;
        }
        
        if (!signatureImageInput.files || signatureImageInput.files.length === 0) {
            alert('Por favor suba una imagen de firma');
            return;
        }

        // Deshabilitar botón durante generación
        const btn = this;
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

        try {
            // Crear una copia del certificado para el PDF
            const certificate = document.getElementById('certificate');
            const certificateClone = certificate.cloneNode(true);
            
            // Asegurarse de que el clon tenga estilos adecuados
            certificateClone.style.width = certificate.offsetWidth + 'px';
            certificateClone.style.height = certificate.offsetHeight + 'px';
            certificateClone.style.position = 'absolute';
            certificateClone.style.left = '-9999px';
            certificateClone.style.top = '0';
            certificateClone.style.visibility = 'visible';
            certificateClone.style.opacity = '1';
            
            // Añadir el clon al documento
            document.body.appendChild(certificateClone);

            // Configuración para html2canvas
            const canvas = await html2canvas(certificateClone, {
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                backgroundColor: null,
                width: certificate.offsetWidth,
                height: certificate.offsetHeight
            });

            // Eliminar el clon después de usarlo
            document.body.removeChild(certificateClone);

            // Crear PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Añadir imagen al PDF
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            // Descargar el PDF
            pdf.save(`Certificado_${studentNameInput.value.trim()}.pdf`);
            
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el PDF. Por favor intente nuevamente.');
        } finally {
            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
});