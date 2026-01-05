export const createMockFile = (
    overrides: Partial<Express.Multer.File> = {}
): Express.Multer.File => {
    return {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/tmp/uploads',
        filename: 'test-image.jpg',
        path: '/tmp/uploads/test-image.jpg',
        size: 1024 * 1024, // 1MB default
        buffer: Buffer.from('fake-image-content'),
        stream: null as any,
        ...overrides
    };
}