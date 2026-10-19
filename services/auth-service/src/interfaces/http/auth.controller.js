const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../infrastructure/prisma');

// 1. Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { username, password, fullname } = req.body;

    // Validate dữ liệu đầu vào
    if (!username || !password || !fullname) {
      return res.status(400).json({ message: 'username, password và fullname là bắt buộc' });
    }

    // Kiểm tra username trùng
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Lưu User vào database
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullname,
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        roleId: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      data: newUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
  }
};

// 2. Đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập username và password' });
    }

    // Tìm User
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // So sánh mật khẩu với hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // Tạo JWT
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role ? user.role.roleName : 'USER',
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // Trả response
    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role ? user.role.roleName : 'USER',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
  }
};

// 3. Lấy thông tin tài khoản hiện tại (Profile)
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        fullname: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};