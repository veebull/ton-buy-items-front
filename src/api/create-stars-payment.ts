import axios from 'axios';

export async function createStarsPayment(invoiceParams: any) {
  try {
    const baseUrl = 'https://web29e18server-production.up.railway.app';
    console.log('Connecting to:', baseUrl);
    console.log('Sending payment request with params:', invoiceParams);

    // Add this to test basic connectivity
    // try {
    // //   const testResponse = await axios.post(
    // //     `${baseUrl}/create-invoice-link`,
    // //     invoiceParams
    // //   );
    // //   console.log('Test connection successful:', testResponse.data);
    // // } catch (error) {
    // //   console.error('Test connection failed:', error);
    // // }

    const formattedInvoiceParams = {
      ...invoiceParams,
      prices: invoiceParams.prices.map((price: any) => ({
        label: price.label,
        amount: price.amount,
      })),
      payload: String(Date.now()),
    };

    const axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: false,
    });

    const { data } = await axiosInstance.post(
      '/create-invoice-link',
      formattedInvoiceParams
    );

    console.log('Response data:', data);
    return data.invoiceLink;
  } catch (error) {
    console.error('Error creating payment:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(`Payment API error: ${errorMessage}`);
    }
    throw new Error(
      `Telegram payment error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
