// components/catalog/CatalogSidebars.tsx
import React from 'react';

interface CatalogSidebarsProps {
  user: any;
  showCartSidebar: boolean;
  onCloseCartSidebar: () => void;
  showMyLearningSidebar: boolean;
  onCloseMyLearningSidebar: () => void;
  onNavigate?: (page: string) => void;
  onItemRemovedFromCart: (itemId: string) => void;
  onItemRemovedFromLearning: (itemId: string) => void;
}

// Mock Cart Sidebar
const CartSidebar = ({ isOpen, onClose, user, onItemRemoved, onNavigate }: any) => {
  // Mock implementation - replace with your actual CartSidebar
  return null;
};

// Mock My Learning Sidebar
const MyLearningSidebar = ({ isOpen, onClose, user, onItemRemoved, onNavigate }: any) => {
  // Mock implementation - replace with your actual MyLearningSidebar
  return null;
};

export const CatalogSidebars: React.FC<CatalogSidebarsProps> = ({
  user,
  showCartSidebar,
  onCloseCartSidebar,
  showMyLearningSidebar,
  onCloseMyLearningSidebar,
  onNavigate,
  onItemRemovedFromCart,
  onItemRemovedFromLearning
}) => {
  return (
    <>
      <CartSidebar
        isOpen={showCartSidebar}
        onClose={onCloseCartSidebar}
        user={user}
        onItemRemoved={onItemRemovedFromCart}
        onNavigate={onNavigate}
      />

      <MyLearningSidebar
        isOpen={showMyLearningSidebar}
        onClose={onCloseMyLearningSidebar}
        user={user}
        onItemRemoved={onItemRemovedFromLearning}
        onNavigate={onNavigate}
      />
    </>
  );
};
 