/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import BlogGenerator from './components/BlogGenerator';
import CardNewsGenerator from './components/CardNewsGenerator';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import DetailPageGenerator from './components/DetailPageGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState('blog');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'blog' && <BlogGenerator />}
      {activeTab === 'cardnews' && <CardNewsGenerator />}
      {activeTab === 'image' && <ImageGenerator />}
      {activeTab === 'video' && <VideoGenerator />}
      {activeTab === 'detailpage' && <DetailPageGenerator />}
    </Layout>
  );
}
