export function loadRazorpay(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window is undefined'));

    const win = window as any;
    if (win.Razorpay) return resolve(win.Razorpay);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.integrity = 'sha384-8C8Oy6x8nMNLpfL8BtCHr6lO6tP1JU0pGf0qbUpWBYV5qYbltRKLABKH6qMDvNMNM'; // For production, update with actual hash
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (win.Razorpay) resolve(win.Razorpay);
      else reject(new Error('Razorpay SDK loaded but window.Razorpay not found'));
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}

export default loadRazorpay;
