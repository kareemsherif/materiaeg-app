import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/whatsapp_fab.dart';
import '../providers/content_provider.dart';
import 'home_screen.dart';
import 'products_screen.dart';
import 'leather_scanner_screen.dart';
import 'industries_screen.dart';
import 'contact_screen.dart';

class MainShell extends StatefulWidget {
  final int initialTab;
  const MainShell({super.key, this.initialTab = 0});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> with WidgetsBindingObserver {
  late int _currentIndex;

  final List<Widget> _screens = const [
    HomeScreen(),
    ProductsScreen(),
    LeatherScannerScreen(isStandaloneTab: true),
    IndustriesScreen(),
    ContactScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _currentIndex = widget.initialTab;
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Whenever user resumes the app, check for any newly added products
      context.read<ContentProvider>().silentSync();
    }
  }

  void _onTabTap(int index) {
    if (index == _currentIndex) return;
    HapticFeedback.selectionClick();
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      body: IndexedStack(
        sizing: StackFit.expand,
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: AppColors.hairline, width: 1.0),
          ),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 60,
            child: Row(
              children: [
                Expanded(
                  child: _buildNavItem(
                    0,
                    Icons.home_outlined,
                    Icons.home_rounded,
                    lang.t('nav.home'),
                  ),
                ),
                Expanded(
                  child: _buildNavItem(
                    1,
                    Icons.grid_view_outlined,
                    Icons.grid_view_rounded,
                    lang.t('nav.products'),
                  ),
                ),
                Expanded(
                  child: _buildNavItem(
                    2,
                    Icons.document_scanner_outlined,
                    Icons.document_scanner_rounded,
                    lang.t('nav.scanner'),
                    isProminent: true,
                  ),
                ),
                Expanded(
                  child: _buildNavItem(
                    3,
                    Icons.factory_outlined,
                    Icons.factory_rounded,
                    lang.t('nav.industries'),
                  ),
                ),
                Expanded(
                  child: _buildNavItem(
                    4,
                    Icons.mail_outline_rounded,
                    Icons.mail_rounded,
                    lang.t('nav.contact'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: const WhatsAppFAB(),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData iconOutline,
    IconData iconFilled,
    String label, {
    bool isProminent = false,
  }) {
    final isActive = _currentIndex == index;
    final activeColor = AppColors.primary;
    final inactiveColor = isProminent ? AppColors.logoBurgundyLight : AppColors.charcoal400;

    return InkWell(
      onTap: () => _onTabTap(index),
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (isProminent)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
              decoration: BoxDecoration(
                color: isActive ? AppColors.burgundy100 : AppColors.burgundy50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isActive ? AppColors.burgundy300 : AppColors.burgundy100,
                  width: 1,
                ),
              ),
              child: Icon(
                isActive ? iconFilled : iconOutline,
                size: 20,
                color: AppColors.logoBurgundy,
              ),
            )
          else
            Icon(
              isActive ? iconFilled : iconOutline,
              size: 21,
              color: isActive ? activeColor : inactiveColor,
            ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 9.5,
              fontWeight: isActive ? FontWeight.w700 : (isProminent ? FontWeight.w600 : FontWeight.w400),
              color: isActive ? activeColor : (isProminent ? AppColors.logoBurgundy : inactiveColor),
              letterSpacing: 0.1,
            ),
          ),
          const SizedBox(height: 1),
          Container(
            width: isActive ? 4 : 0,
            height: 4,
            decoration: BoxDecoration(
              color: isActive ? AppColors.primary : Colors.transparent,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }
}
