import {
  autoOptimizeImage,
  generateImagePlaceholder,
  generateResponsiveImages,
} from '~/lib/imageOptimization';
import logger from '~/lib/logger';

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const operation = (formData.get('operation') as string) || 'optimize';
    const options = JSON.parse((formData.get('options') as string) || '{}');

    if (!file) {
      return new Response('No image provided', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type;

    let result;

    switch (operation) {
      case 'optimize':
        result = await autoOptimizeImage(buffer, contentType);
        break;

      case 'responsive':
        const sizes = options.sizes || [320, 640, 1024, 1920];
        const responsiveImages = await generateResponsiveImages(buffer, sizes);
        return new Response(
          JSON.stringify({
            success: true,
            images: responsiveImages.map(img => ({
              size: img.size,
              format: img.format,
              data: img.buffer.toString('base64'),
            })),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'placeholder':
        const placeholder = await generateImagePlaceholder(
          buffer,
          options.width,
          options.height
        );
        return new Response(
          JSON.stringify({
            success: true,
            placeholder,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      default:
        return new Response('Invalid operation', { status: 400 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.size,
          originalSize: result.originalSize,
          compressionRatio: result.compressionRatio,
          data: result.buffer.toString('base64'),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('Image optimization failed:', error);
    return new Response('Image optimization failed', { status: 500 });
  }
}
