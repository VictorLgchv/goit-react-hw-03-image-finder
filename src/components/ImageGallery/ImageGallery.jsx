import { ErrorView } from 'components/ErrorView/ErrorView';
import { ImageGalleryItem } from 'components/ImageGalleryItem/ImageGalleryItem';

import React, { Component } from 'react';

import ImagesApi from 'services/images-api';
import Button from 'components/Button/Button';
import Loader from 'components/Loader/Loader';

import { Title, App, List } from './ImageGallery.styled';

import PropTypes from 'prop-types';

export class ImageGallery extends Component {
  state = {
    images: [],
    error: null,
    status: 'idle',
    searchPage: 1,
    loading: false,
    loadMore: false,
  };

  componentDidUpdate(prevProps, prevState) {
    const { search } = this.props;

    if (prevProps.search !== search) {
      this.setState({ images: [], searchPage: 1, status: 'pending' });
    }

    if (prevState.loading !== this.state.loading) {
      this.props.onLoading(this.state.loading);
    }
    if (
      prevProps.search !== search ||
      prevState.searchPage !== this.state.searchPage
    ) {
      this.fetchImages();
    }
  }

  fetchImages = () => {
    const { search } = this.props;
    ImagesApi(search, this.state.searchPage)
      .then(({ data }) => {
        if (data.hits.length === 0) {
          return Promise.reject(
            new Error(`По запиту ${search} ми нічого не знайшли`)
          );
        }
        console.log(data.totalHits)
        return this.setState(prevState => ({
          images: [...prevState.images, ...data.hits],
          loadMore: this.state.searchPage < Math.ceil(data.totalHits / 12 ),
          status: 'resolved',
          loading: false
        }));
      })
      .catch(error => this.setState({ error, status: 'rejected' }));
  };

  handlerLoadMoreBtn = () => {
    this.setState(prevState => ({
      searchPage: prevState.searchPage + 1,
      loading: true,
    }));
  };

  render() {
    const { error, images, status, loading, loadMore } = this.state;

    if (status === 'idle') {
      return <Title>ready to search</Title>;
    }

    if (status === 'pending') {
      return <Loader />;
    }

    if (status === 'rejected') {
      return <ErrorView message={error.message} />;
    }

    if (status === 'resolved' && images.length !== 0) {
      return (
        <App>
          <List>
            {images.map(({ id, webformatURL, largeImageURL, tags }) => (
              <ImageGalleryItem
                key={id}
                webImg={webformatURL}
                largeImg={largeImageURL}
                tags={tags}
              />
            ))}
          </List>
          {!loading && loadMore && <Button onBtnClick={this.handlerLoadMoreBtn} />}
        </App>
      );
    }
  }
}

ImageGallery.propTypes = {
  search: PropTypes.string.isRequired,
};