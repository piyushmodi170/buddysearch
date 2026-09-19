export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const loadRazorpay = loadRazorpayScript;

export const openCheckout = async (options: any) => {
  const res = await loadRazorpayScript();
  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }
  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
